//
//  UserProfile.swift
//  CardioGuard
//

import Foundation

/// User profile from onboarding: HF type, meds, baseline vitals, conditions.
struct UserProfile: Codable {
    var heartFailureType: HeartFailureType
    var medicationIds: [String]
    var baselineRestingHR: Double?
    var baselineWeightKg: Double?
    var activityLevel: ActivityLevel
    var age: Int?
    var hasCKD: Bool
    var hasDiabetes: Bool
    var hasHypertension: Bool

    init(
        heartFailureType: HeartFailureType = .atRisk,
        medicationIds: [String] = [],
        baselineRestingHR: Double? = nil,
        baselineWeightKg: Double? = nil,
        activityLevel: ActivityLevel = .moderate,
        age: Int? = nil,
        hasCKD: Bool = false,
        hasDiabetes: Bool = false,
        hasHypertension: Bool = false
    ) {
        self.heartFailureType = heartFailureType
        self.medicationIds = medicationIds
        self.baselineRestingHR = baselineRestingHR
        self.baselineWeightKg = baselineWeightKg
        self.activityLevel = activityLevel
        self.age = age
        self.hasCKD = hasCKD
        self.hasDiabetes = hasDiabetes
        self.hasHypertension = hasHypertension
    }
}

enum ActivityLevel: String, CaseIterable, Identifiable, Codable {
    case sedentary = "Sedentary"
    case light = "Light"
    case moderate = "Moderate"
    case active = "Active"

    var id: String { rawValue }
}
