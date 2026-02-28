//
//  RiskScoringEngine.swift
//  CardioGuard
//

import Foundation

/// Computes daily Risk Score (0–100) from baselines, metrics, symptoms, and HF type.
struct RiskScoringEngine {
    let profile: UserProfile
    let metrics: [HealthMetricSample]
    let symptomEntries: [SymptomEntry]
    let alertDates: Set<Date>  // dates when alerts fired (for annotations)

    /// Compute today's risk score and level.
    func computeDailyScore(date: Date = Date()) -> (score: Double, level: RiskLevel) {
        let score = rawScore(for: date)
        let level = RiskLevel(score: score)
        return (min(100, max(0, score)), level)
    }

    private func rawScore(for date: Date) -> Double {
        let cal = Calendar.current
        let dayStart = cal.startOfDay(for: date)
        let sevenDaysAgo = cal.date(byAdding: .day, value: -7, to: dayStart) ?? dayStart
        let threeDaysAgo = cal.date(byAdding: .day, value: -3, to: dayStart) ?? dayStart

        var total: Double = 0
        var weightSum: Double = 0

        let hf = profile.heartFailureType
        let meds = profile.medicationIds.compactMap { id in Medication.searchableList.first { $0.id == id } }

        // Metric deviations (weighted by HF type priority)
        for metric in hf.priorityMetrics where metric.healthKitCompatible {
            let (contrib, weight) = metricContribution(metric, date: date, sevenDaysAgo: sevenDaysAgo, threeDaysAgo: threeDaysAgo, meds: meds)
            total += contrib * weight
            weightSum += weight
        }

        // Symptom score (today or recent)
        let symptomScore = symptomContribution(for: date)
        total += symptomScore * 0.35
        weightSum += 0.35

        // Medication flags (e.g. bradycardia on Digoxin)
        let medFlag = medicationFlagScore(meds: meds, date: date)
        total += medFlag
        weightSum += 0.1

        if weightSum <= 0 { return 0 }
        return total / weightSum
    }

    private func metricContribution(
        _ metric: MetricType,
        date: Date,
        sevenDaysAgo: Date,
        threeDaysAgo: Date,
        meds: [Medication]
    ) -> (Double, Double) {
        let samples = metrics.filter { $0.metricType == metric && $0.date >= sevenDaysAgo && $0.date <= date }
        let weight: Double = 0.15

        switch metric {
        case .heartRate:
            let baseline = profile.baselineRestingHR ?? 72
            let adjustedBaseline = meds.contains(where: { $0.affectsThresholds == .betaBlocker }) ? baseline * 0.85 : baseline
            let recent = samples.suffix(20).map(\.value)
            let avg = recent.isEmpty ? nil : recent.reduce(0, +) / Double(recent.count)
            guard let avg = avg else { return (0, weight) }
            if avg > adjustedBaseline * 1.15 { return (55, weight) }  // >15% elevated
            if avg > adjustedBaseline * 1.05 { return (25, weight) }
            if meds.contains(where: { $0.affectsThresholds == .digoxin }) && avg < 50 { return (70, weight) }
            return (0, weight)

        case .hrv:
            let recent = samples.suffix(30).map(\.value)
            guard recent.count >= 5 else { return (0, weight) }
            let firstHalf = recent.prefix(recent.count / 2).reduce(0, +) / Double(recent.count / 2)
            let secondHalf = recent.suffix(recent.count / 2).reduce(0, +) / Double(recent.count / 2)
            if firstHalf > 0 && secondHalf < firstHalf * 0.80 { return (50, weight) }  // >20% decline
            return (0, weight)

        case .respiratoryRate:
            let recent = samples.map(\.value)
            let avg = recent.isEmpty ? nil : recent.reduce(0, +) / Double(recent.count)
            guard let avg = avg else { return (0, weight) }
            let baseline: Double = 16
            if avg > baseline * 1.10 { return (40, weight) }
            return (0, weight)

        case .weight:
            let weightSamples = samples.sorted { $0.date < $1.date }
            let diuretic = meds.contains { $0.affectsThresholds == .diuretic }
            let thresholdKg = diuretic ? 1.5 : 2.0
            let daysForThreshold = diuretic ? 2 : 3
            let periodStart = Calendar.current.date(byAdding: .day, value: -daysForThreshold, to: date) ?? date
            let inPeriod = weightSamples.filter { $0.date >= periodStart }
            guard let first = inPeriod.first?.value, let last = inPeriod.last?.value else { return (0, weight) }
            let gain = last - first
            if gain >= thresholdKg { return (65, weight) }
            if gain >= thresholdKg * 0.7 { return (30, weight) }
            return (0, weight)

        case .steps:
            let byDay = Dictionary(grouping: samples, by: { Calendar.current.startOfDay(for: $0.date) })
            let dailyTotals = byDay.mapValues { $0.reduce(0) { $0 + $1.value } }
            let sorted = dailyTotals.sorted { $0.key < $1.key }.map(\.value)
            guard sorted.count >= 7 else { return (0, weight) }
            let firstHalfAvg = sorted.prefix(3).reduce(0, +) / 3
            let secondHalfAvg = sorted.suffix(3).reduce(0, +) / 3
            if firstHalfAvg > 0 && secondHalfAvg < firstHalfAvg * 0.70 { return (45, weight) }  // >30% decline
            return (0, weight)

        case .sleep:
            let recent = samples.suffix(7).map(\.value)
            let avg = recent.isEmpty ? nil : recent.reduce(0, +) / Double(recent.count)
            if let avg = avg, avg < 4.5 { return (25, weight) }
            return (0, weight)

        default:
            return (0, weight)
        }
    }

    private func symptomContribution(for date: Date) -> Double {
        let cal = Calendar.current
        let dayStart = cal.startOfDay(for: date)
        let entry = symptomEntries.first { cal.isDate($0.date, inSameDayAs: dayStart) }
        guard let entry = entry else { return 0 }
        var score = entry.compositeScore
        // Consecutive dyspnea/fatigue (HFpEF): 3+ days
        let last7 = symptomEntries.filter { $0.date >= cal.date(byAdding: .day, value: -7, to: dayStart)! && $0.date <= dayStart }
        let badDays = last7.filter { $0.shortnessOfBreath != .none || $0.fatigueLevel >= 4 }.count
        if badDays >= 3 { score += 20 }
        // Edema 2+ days (right-sided)
        if profile.heartFailureType == .rightSided {
            let edemaDays = last7.filter { $0.ankleSwelling }.count
            if edemaDays >= 2 { score += 25 }
        }
        return min(100, score)
    }

    private func medicationFlagScore(meds: [Medication], date: Date) -> Double {
        var flag: Double = 0
        let hrSamples = metrics.filter { $0.metricType == .heartRate && $0.date >= Calendar.current.date(byAdding: .day, value: -1, to: date)! }
        let recentHR = hrSamples.suffix(10).map(\.value)
        let avgHR = recentHR.isEmpty ? nil : recentHR.reduce(0, +) / Double(recentHR.count)
        if meds.contains(where: { $0.affectsThresholds == .digoxin }), let hr = avgHR, hr < 50 {
            flag += 40
        }
        return min(100, flag)
    }
}
