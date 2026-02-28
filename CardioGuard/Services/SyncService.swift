//
//  SyncService.swift
//  CardioGuard
//
//  Pushes profile, metrics, symptoms, and alerts to the CardioGuard web app.
//

import Foundation
import UIKit

struct SyncPayload: Encodable {
    let deviceId: String
    let syncCode: String?
    let profile: ProfilePayload?
    let metrics: [MetricPayload]?
    let symptoms: [SymptomPayload]?
    let alerts: [AlertPayload]?
    let liveHR: Double?
    let liveHRV: Double?
    let riskScore: Double?
    let riskLevel: String?
}

struct ProfilePayload: Encodable {
    let heartFailureType: String
    let medicationIds: [String]
    let baselineRestingHR: Double?
    let baselineWeightKg: Double?
    let activityLevel: String
    let age: Int?
    let hasCKD: Bool
    let hasDiabetes: Bool
    let hasHypertension: Bool
}

struct MetricPayload: Encodable {
    let date: String
    let metricType: String
    let value: Double
    let unit: String?
}

struct SymptomPayload: Encodable {
    let date: String
    let shortnessOfBreath: String
    let fatigueLevel: Int
    let ankleSwelling: Bool
    let dizzinessOrPalpitations: Bool
    let sleepQuality: String
}

struct AlertPayload: Encodable {
    let date: String
    let kind: String
    let title: String
    let message: String
    let wasRedRisk: Bool
}

final class SyncService: ObservableObject {
    static let shared = SyncService()

    private let baseURLKey = "cardioGuard.syncBaseURL"
    private let syncCodeKey = "cardioGuard.syncCode"
    private let deviceIdKey = "cardioGuard.deviceId"

    var baseURL: String {
        get { UserDefaults.standard.string(forKey: baseURLKey) ?? "" }
        set { UserDefaults.standard.set(newValue, forKey: baseURLKey) }
    }

    var syncCode: String? {
        get { UserDefaults.standard.string(forKey: syncCodeKey) }
        set { UserDefaults.standard.set(newValue, forKey: syncCodeKey) }
    }

    private var deviceId: String {
        if let id = UserDefaults.standard.string(forKey: deviceIdKey), !id.isEmpty { return id }
        let id = UIDevice.current.identifierForVendor?.uuidString ?? UUID().uuidString
        UserDefaults.standard.set(id, forKey: deviceIdKey)
        return id
    }

    private let encoder: JSONEncoder = {
        let e = JSONEncoder()
        e.dateEncodingStrategy = .iso8601
        return e
    }()

    func sync(
        profile: UserProfile?,
        metrics: [HealthMetricSample],
        symptoms: [SymptomEntry],
        alerts: [AlertRecord],
        liveHR: Double?,
        liveHRV: Double?,
        riskScore: Double,
        riskLevel: RiskLevel
    ) async throws -> String? {
        var host = baseURL.trimmingCharacters(in: .whitespacesAndNewlines)
        if host.hasSuffix("/") { host.removeLast() }
        guard let url = URL(string: host + "/api/sync"),
              !baseURL.isEmpty else {
            throw NSError(domain: "SyncService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Set the web dashboard URL in Settings."])
        }

        let profilePayload: ProfilePayload? = profile.map {
            ProfilePayload(
                heartFailureType: $0.heartFailureType.rawValue,
                medicationIds: $0.medicationIds,
                baselineRestingHR: $0.baselineRestingHR,
                baselineWeightKg: $0.baselineWeightKg,
                activityLevel: $0.activityLevel.rawValue,
                age: $0.age,
                hasCKD: $0.hasCKD,
                hasDiabetes: $0.hasDiabetes,
                hasHypertension: $0.hasHypertension
            )
        }

        let metricPayloads = metrics.suffix(500).map { m in
            MetricPayload(
                date: ISO8601DateFormatter().string(from: m.date),
                metricType: m.metricType.rawValue,
                value: m.value,
                unit: m.unit
            )
        }

        let symptomPayloads = symptoms.map { s in
            SymptomPayload(
                date: ISO8601DateFormatter().string(from: s.date),
                shortnessOfBreath: s.shortnessOfBreath.rawValue,
                fatigueLevel: s.fatigueLevel,
                ankleSwelling: s.ankleSwelling,
                dizzinessOrPalpitations: s.dizzinessOrPalpitations,
                sleepQuality: s.sleepQuality.rawValue
            )
        }

        let alertPayloads = alerts.map { a in
            AlertPayload(
                date: ISO8601DateFormatter().string(from: a.date),
                kind: a.kind.rawValue,
                title: a.title,
                message: a.message,
                wasRedRisk: a.wasRedRisk
            )
        }

        let payload = SyncPayload(
            deviceId: deviceId,
            syncCode: syncCode,
            profile: profilePayload,
            metrics: metricPayloads.isEmpty ? nil : metricPayloads,
            symptoms: symptomPayloads.isEmpty ? nil : symptomPayloads,
            alerts: alertPayloads.isEmpty ? nil : alertPayloads,
            liveHR: liveHR,
            liveHRV: liveHRV,
            riskScore: riskScore,
            riskLevel: riskLevel.rawValue
        )

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try encoder.encode(payload)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
            throw NSError(domain: "SyncService", code: -2, userInfo: [NSLocalizedDescriptionKey: "Server error or invalid URL."])
        }

        struct SyncResponse: Decodable { let syncCode: String? }
        let decoded = try? JSONDecoder().decode(SyncResponse.self, from: data)
        if let code = decoded?.syncCode, !code.isEmpty {
            syncCode = code
            return code
        }
        return nil
    }
}
