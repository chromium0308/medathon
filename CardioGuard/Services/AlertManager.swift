//
//  AlertManager.swift
//  CardioGuard
//

import Foundation
import UserNotifications

/// Evaluates alert conditions and sends local notifications; records to history.
final class AlertManager: ObservableObject {
    private let profileStore = ProfileStore.shared
    private let repository: DataRepository
    private var saveAlert: (AlertRecord) -> Void

    init(repository: DataRepository, saveAlert: @escaping (AlertRecord) -> Void) {
        self.repository = repository
        self.saveAlert = saveAlert
    }

    func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { _, _ in }
    }

    /// Call after computing risk score and when new metrics/symptoms are available.
    func evaluateAlerts(
        riskScore: Double,
        latestHR: Double?,
        metrics: [HealthMetricSample],
        symptomEntries: [SymptomEntry],
        date: Date = Date()
    ) {
        guard let profile = profileStore.load() else { return }
        let cal = Calendar.current
        let dayStart = cal.startOfDay(for: date)
        let threeDaysAgo = cal.date(byAdding: .day, value: -3, to: dayStart) ?? dayStart
        let sevenDaysAgo = cal.date(byAdding: .day, value: -7, to: dayStart) ?? dayStart

        // Red risk score
        if riskScore >= 70 {
            sendAndSave(
                kind: .redRiskScore,
                title: "High risk score",
                message: "Your risk score is in the red zone. Please contact your cardiologist.",
                wasRedRisk: true
            )
        }

        // Bradycardia / Tachycardia
        if let hr = latestHR {
            if hr < 50 {
                sendAndSave(
                    kind: .bradycardia,
                    title: "Low heart rate",
                    message: "Your heart rate is below 50 BPM. If you take Digoxin, this may be significant. Contact your care team if you feel unwell.",
                    wasRedRisk: false
                )
            } else if hr > 120 {
                sendAndSave(
                    kind: .tachycardia,
                    title: "Elevated heart rate",
                    message: "Your resting heart rate has been elevated above 120 BPM. Reduce physical exertion and monitor symptoms. Contact your cardiologist if it persists.",
                    wasRedRisk: false
                )
            }
        }

        // Weight gain
        let weightSamples = metrics.filter { $0.metricType == .weight && $0.date >= threeDaysAgo }
        let meds = profile.medicationIds.compactMap { id in Medication.searchableList.first { $0.id == id } }
        let diuretic = meds.contains { $0.affectsThresholds == .diuretic }
        let threshold = diuretic ? 1.5 : 2.0
        let daysCheck = diuretic ? 2 : 3
        let periodStart = cal.date(byAdding: .day, value: -daysCheck, to: date) ?? date
        let inPeriod = weightSamples.filter { $0.date >= periodStart }.sorted { $0.date < $1.date }
        if let first = inPeriod.first?.value, let last = inPeriod.last?.value, (last - first) >= threshold {
            let gain = last - first
            sendAndSave(
                kind: .weightGain,
                title: "Weight gain",
                message: String(format: "Your weight has increased %.1f kg over %d days — this may indicate fluid retention. Please contact your cardiologist.", gain, daysCheck),
                wasRedRisk: false
            )
        }

        // Irregular rhythm (from HealthKit)
        let irr = metrics.filter { $0.metricType == .irregularRhythm && $0.date >= dayStart }
        if !irr.isEmpty {
            sendAndSave(
                kind: .irregularRhythm,
                title: "Irregular heart rhythm",
                message: "An irregular heart rhythm event was detected. Please discuss with your cardiologist.",
                wasRedRisk: false
            )
        }

        // Declining activity (3+ days)
        let stepsByDay = Dictionary(grouping: metrics.filter { $0.metricType == .steps && $0.date >= sevenDaysAgo }, by: { cal.startOfDay(for: $0.date) })
        let dailySteps = stepsByDay.mapValues { $0.reduce(0) { $0 + $1.value } }
        let sorted = dailySteps.sorted { $0.key < $1.key }.map(\.value)
        if sorted.count >= 7 {
            let first = sorted.prefix(3).reduce(0, +) / 3
            let last = sorted.suffix(3).reduce(0, +) / 3
            if first > 500 && last < first * 0.70 {
                sendAndSave(
                    kind: .decliningActivity,
                    title: "Declining activity",
                    message: "Your step count has declined over the past week. Try to stay active within your limits and report any new symptoms to your care team.",
                    wasRedRisk: false
                )
            }
        }

        // HFrEF: HR elevated >15% for 3+ days (simplified: use recent avg vs baseline)
        if profile.heartFailureType == .hfref, let baseline = profile.baselineRestingHR {
            let hrSamples = metrics.filter { $0.metricType == .heartRate && $0.date >= threeDaysAgo }
            let byDay = Dictionary(grouping: hrSamples, by: { cal.startOfDay(for: $0.date) })
            let dayCount = byDay.keys.count
            if dayCount >= 3 {
                let avgRecent = hrSamples.suffix(50).map(\.value)
                let avg = avgRecent.isEmpty ? 0 : avgRecent.reduce(0, +) / Double(avgRecent.count)
                if avg > baseline * 1.15 {
                    sendAndSave(
                        kind: .elevatedRR,
                        title: "Elevated heart rate",
                        message: "Your resting heart rate has been elevated above your baseline for several days. Reduce physical exertion and monitor symptoms.",
                        wasRedRisk: false
                    )
                }
            }
        }
    }

    private func sendAndSave(kind: AlertKind, title: String, message: String, wasRedRisk: Bool) {
        let record = AlertRecord(date: Date(), kind: kind, title: title, message: message, wasRedRisk: wasRedRisk)
        saveAlert(record)
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = message
        content.sound = .default
        let request = UNNotificationRequest(identifier: record.id.uuidString, content: content, trigger: UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false))
        UNUserNotificationCenter.current().add(request)
    }
}
