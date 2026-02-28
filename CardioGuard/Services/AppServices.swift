//
//  AppServices.swift
//  CardioGuard
//

import SwiftUI
import CoreData

/// Holds HealthKit, repository, alert manager, and profile store; starts polling after onboarding.
final class AppServices: ObservableObject {
    let healthKit = HealthKitService()
    let profileStore = ProfileStore.shared
    private(set) var repository: DataRepository!
    private(set) var alertManager: AlertManager!

    func configure(context: NSManagedObjectContext) {
        guard repository == nil else { return }
        repository = DataRepository(context: context)
        alertManager = AlertManager(repository: repository) { [weak self] record in
            self?.repository.saveAlert(record)
        }
        alertManager.requestNotificationPermission()
    }

    func startBackgroundPolling() {
        guard let repo = repository else { return }
        healthKit.startPolling { sample in
            repo.saveMetric(sample)
            DispatchQueue.main.async {
                self.evaluateRiskAndAlerts()
            }
        }
    }

    func stopBackgroundPolling() {
        healthKit.stopPolling()
    }

    /// Recompute risk and fire alerts if needed (call after new data or symptom log).
    func evaluateRiskAndAlerts() {
        guard let profile = profileStore.load(), let repo = repository else { return }
        let end = Date()
        let start = Calendar.current.date(byAdding: .day, value: -30, to: end) ?? end
        let metrics = repo.allMetrics(from: start, to: end)
        let symptoms = repo.symptomEntries(from: start, to: end)
        let engine = RiskScoringEngine(profile: profile, metrics: metrics, symptomEntries: symptoms, alertDates: [])
        let (score, _) = engine.computeDailyScore(date: end)
        Task { @MainActor in
            let latestHR = await healthKit.fetchLatestHeartRate()
            alertManager.evaluateAlerts(riskScore: score, latestHR: latestHR, metrics: metrics, symptomEntries: symptoms, date: end)
        }
    }

    /// Sync current data to the web dashboard. Returns new sync code if server returns one.
    func syncToWeb() async throws -> String? {
        guard let repo = repository else { throw NSError(domain: "AppServices", code: -1, userInfo: [NSLocalizedDescriptionKey: "Not configured"]) }
        let profile = profileStore.load()
        let end = Date()
        let start = Calendar.current.date(byAdding: .day, value: -90, to: end) ?? end
        let metrics = repo.allMetrics(from: start, to: end)
        let symptoms = repo.symptomEntries(from: start, to: end)
        let alerts = repo.alertHistory(limit: 200)
        let (score, level) = profile.map { p in
            let engine = RiskScoringEngine(profile: p, metrics: metrics, symptomEntries: symptoms, alertDates: [])
            return engine.computeDailyScore(date: end)
        } ?? (0, .green)
        let liveHR = await healthKit.fetchLatestHeartRate()
        let liveHRV = await healthKit.fetchLatestHRV()
        return try await SyncService.shared.sync(
            profile: profile,
            metrics: metrics,
            symptoms: symptoms,
            alerts: alerts,
            liveHR: liveHR,
            liveHRV: liveHRV,
            riskScore: score,
            riskLevel: level
        )
    }
}
