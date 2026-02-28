//
//  HealthKitService.swift
//  CardioGuard
//

import Foundation
import HealthKit

/// Fetches health data from HealthKit and writes trend samples to Core Data.
final class HealthKitService: ObservableObject {
    private let store = HKHealthStore()
    private let pollInterval: TimeInterval = 15 * 60 // 15 minutes
    private var pollTimer: Timer?
    private var lastPollDate: Date?

    var isAuthorized: Bool { store.authorizationStatus(for: HKQuantityType(.heartRate)) == .sharingAuthorized }

    /// Types we read.
    private static var readTypes: Set<HKObjectType> {
        var types: Set<HKObjectType> = [
            HKQuantityType(.heartRate),
            HKQuantityType(.heartRateVariabilitySDNN),
            HKQuantityType(.respiratoryRate),
            HKQuantityType(.stepCount),
            HKQuantityType(.bodyMass),
            HKCategoryType(.sleepAnalysis),
        ]
        if #available(iOS 16.0, *) {
            types.insert(HKCategoryType(.irregularHeartRhythmEvent))
        }
        return types
    }

    func requestAuthorization() async throws {
        try await store.requestAuthorization(toShare: [], read: Self.readTypes)
    }

    func startPolling(saveMetric: @escaping (HealthMetricSample) -> Void) {
        stopPolling()
        pollTimer = Timer.scheduledTimer(withTimeInterval: pollInterval, repeats: true) { [weak self] _ in
            Task { @MainActor in
                await self?.pollAndSave(saveMetric: saveMetric)
            }
        }
        pollTimer?.tolerance = 60
        RunLoop.current.add(pollTimer!, forMode: .common)
        Task { @MainActor in
            await pollAndSave(saveMetric: saveMetric)
        }
    }

    func stopPolling() {
        pollTimer?.invalidate()
        pollTimer = nil
    }

    private func pollAndSave(saveMetric: @escaping (HealthMetricSample) -> Void) async {
        let end = Date()
        let start = Calendar.current.date(byAdding: .day, value: -1, to: end) ?? end
        do {
            let samples = try await fetchSamples(from: start, to: end)
            for s in samples {
                saveMetric(s)
            }
            lastPollDate = end
        } catch {
            print("HealthKit poll error: \(error)")
        }
    }

    /// One-time fetch for dashboard/trends (e.g. last 7 days).
    func fetchSamples(from start: Date, to end: Date) async throws -> [HealthMetricSample] {
        var results: [HealthMetricSample] = []

        // Heart rate (resting preferred via HKQueryOption)
        let hrType = HKQuantityType(.heartRate)
        let hrUnit = HKUnit.count().unitDivided(by: .minute())
        let hrSamples = try await queryQuantity(hrType, unit: hrUnit, start: start, end: end, options: .discreteAverage)
        results.append(contentsOf: hrSamples.map { HealthMetricSample(date: $0.0, metricType: .heartRate, value: $0.1, unit: "bpm") })

        // HRV
        let hrvType = HKQuantityType(.heartRateVariabilitySDNN)
        let hrvUnit = HKUnit.secondUnit(with: .milli)
        let hrvSamples = try await queryQuantity(hrvType, unit: hrvUnit, start: start, end: end, options: .discreteAverage)
        results.append(contentsOf: hrvSamples.map { HealthMetricSample(date: $0.0, metricType: .hrv, value: $0.1, unit: "ms") })

        // Respiratory rate
        let rrType = HKQuantityType(.respiratoryRate)
        let rrUnit = HKUnit.count().unitDivided(by: .minute())
        let rrSamples = try await queryQuantity(rrType, unit: rrUnit, start: start, end: end, options: .discreteAverage)
        results.append(contentsOf: rrSamples.map { HealthMetricSample(date: $0.0, metricType: .respiratoryRate, value: $0.1, unit: "/min") })

        // Steps
        let stepsType = HKQuantityType(.stepCount)
        let stepsUnit = HKUnit.count()
        let stepsSamples = try await queryQuantity(stepsType, unit: stepsUnit, start: start, end: end, options: .cumulativeSum)
        results.append(contentsOf: stepsSamples.map { HealthMetricSample(date: $0.0, metricType: .steps, value: $0.1, unit: "count") })

        // Weight
        let weightType = HKQuantityType(.bodyMass)
        let weightUnit = HKUnit.gramUnit(with: .kilo)
        let weightSamples = try await queryQuantity(weightType, unit: weightUnit, start: start, end: end, options: .discreteAverage)
        results.append(contentsOf: weightSamples.map { HealthMetricSample(date: $0.0, metricType: .weight, value: $0.1, unit: "kg") })

        // Sleep (as hours)
        let sleepType = HKCategoryType(.sleepAnalysis)
        let sleepSamples = try await querySleep(start: start, end: end)
        results.append(contentsOf: sleepSamples.map { HealthMetricSample(date: $0.0, metricType: .sleep, value: $0.1, unit: "hr") })

        // Irregular rhythm (count in period)
        if #available(iOS 16.0, *) {
            let irrType = HKCategoryType(.irregularHeartRhythmEvent)
            let irrSamples = try await queryIrregularRhythm(type: irrType, start: start, end: end)
            results.append(contentsOf: irrSamples.map { HealthMetricSample(date: $0.0, metricType: .irregularRhythm, value: $0.1, unit: "count") })
        }

        return results
    }

    private func queryQuantity(
        _ type: HKQuantityType,
        unit: HKUnit,
        start: Date,
        end: Date,
        options: HKStatisticsOptions
    ) async throws -> [(Date, Double)] {
        let predicate = HKQuery.predicateForSamples(withStart: start, end: end, options: .strictStartDate)
        return await withCheckedContinuation { continuation in
            let query = HKStatisticsCollectionQuery(
                quantityType: type,
                quantitySamplePredicate: predicate,
                options: options,
                anchorDate: Calendar.current.startOfDay(for: start),
                interval: DateComponents(minute: 15)
            )
            query.initialResultsHandler = { _, results, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }
                var list: [(Date, Double)] = []
                results?.enumerateStatistics(from: start, to: end) { stats, _ in
                    let value: Double
                    if let sum = stats.sumQuantity() {
                        value = sum.doubleValue(for: unit)
                    } else if let avg = stats.averageQuantity() {
                        value = avg.doubleValue(for: unit)
                    } else {
                        return
                    }
                    list.append((stats.startDate, value))
                }
                continuation.resume(returning: list)
            }
            store.execute(query)
        }
    }

    private func querySleep(start: Date, end: Date) async throws -> [(Date, Double)] {
        let type = HKCategoryType(.sleepAnalysis)
        let predicate = HKQuery.predicateForSamples(withStart: start, end: end, options: .strictStartDate)
        return await withCheckedContinuation { continuation in
            let query = HKSampleQuery(sampleType: type, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)]) { _, samples, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }
                let catSamples = (samples as? [HKCategorySample]) ?? []
                // Group by day and sum asleep time (in bed = 0, asleep = 1, awake = 2, etc.)
                var byDay: [Date: TimeInterval] = [:]
                let cal = Calendar.current
                for s in catSamples {
                    let dayStart = cal.startOfDay(for: s.startDate)
                    let value = s.value == HKCategoryValueSleepAnalysis.asleep.rawValue ? s.endDate.timeIntervalSince(s.startDate) : 0
                    byDay[dayStart, default: 0] += value
                }
                let list = byDay.map { ($0.key, $0.value / 3600.0) }.sorted { $0.0 < $1.0 }
                continuation.resume(returning: list)
            }
            store.execute(query)
        }
    }

    @available(iOS 16.0, *)
    private func queryIrregularRhythm(type: HKCategoryType, start: Date, end: Date) async throws -> [(Date, Double)] {
        let predicate = HKQuery.predicateForSamples(withStart: start, end: end, options: .strictStartDate)
        return await withCheckedContinuation { continuation in
            let query = HKSampleQuery(sampleType: type, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)]) { _, samples, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }
                let list = (samples ?? []).map { ($0.startDate, 1.0) }
                continuation.resume(returning: list)
            }
            store.execute(query)
        }
    }

    /// Latest single value for a metric (e.g. for dashboard "live" display).
    func fetchLatestHeartRate() async -> Double? {
        let type = HKQuantityType(.heartRate)
        let unit = HKUnit.count().unitDivided(by: .minute())
        let end = Date()
        let start = Calendar.current.date(byAdding: .minute, value: -30, to: end) ?? end
        let predicate = HKQuery.predicateForSamples(withStart: start, end: end, options: .strictStartDate)
        return await withCheckedContinuation { cont in
            let q = HKSampleQuery(sampleType: type, predicate: predicate, limit: 1, sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)]) { _, samples, _ in
                let val = (samples?.first as? HKQuantitySample)?.quantity.doubleValue(for: unit)
                cont.resume(returning: val)
            }
            store.execute(q)
        }
    }

    func fetchLatestHRV() async -> Double? {
        let type = HKQuantityType(.heartRateVariabilitySDNN)
        let unit = HKUnit.secondUnit(with: .milli)
        let end = Date()
        let start = Calendar.current.date(byAdding: .hour, value: -2, to: end) ?? end
        let predicate = HKQuery.predicateForSamples(withStart: start, end: end, options: .strictStartDate)
        return await withCheckedContinuation { cont in
            let q = HKSampleQuery(sampleType: type, predicate: predicate, limit: 1, sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)]) { _, samples, _ in
                let val = (samples?.first as? HKQuantitySample)?.quantity.doubleValue(for: unit)
                cont.resume(returning: val)
            }
            store.execute(q)
        }
    }
}

/// Stored metric sample (HealthKit-derived or from risk engine).
struct HealthMetricSample: Identifiable {
    var id: UUID { UUID() }
    var date: Date
    var metricType: MetricType
    var value: Double
    var unit: String

    static func metricType(from string: String) -> MetricType? {
        MetricType(rawValue: string)
    }
}

extension HealthMetricSample {
    init?(from entity: HealthMetricEntity) {
        guard let d = entity.date, let t = entity.metricType, let type = MetricType(rawValue: t) else { return nil }
        self.date = d
        self.metricType = type
        self.value = entity.value
        self.unit = entity.unit ?? ""
    }
}

extension MetricType {
    var healthKitCompatible: Bool {
        switch self {
        case .heartRate, .hrv, .respiratoryRate, .steps, .sleep, .weight, .irregularRhythm: return true
        case .symptoms, .edema: return false
        }
    }
}

// Add irregular rhythm to MetricType if we use it in trends
extension MetricType {
    static var allHealth: [MetricType] { [.heartRate, .hrv, .respiratoryRate, .steps, .weight, .sleep] }
}
