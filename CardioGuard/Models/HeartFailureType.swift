//
//  HeartFailureType.swift
//  CardioGuard
//

import Foundation

enum HeartFailureType: String, CaseIterable, Identifiable, Codable {
    case hfref = "HFrEF"
    case hfpef = "HFpEF"
    case rightSided = "Right-sided"
    case leftSided = "Left-sided"
    case atRisk = "At Risk / Undiagnosed"

    var id: String { rawValue }

    var displayName: String { rawValue }

    var shortDescription: String {
        switch self {
        case .hfref: return "Systolic heart failure (reduced ejection fraction)"
        case .hfpef: return "Diastolic heart failure (preserved ejection fraction)"
        case .rightSided: return "Right-sided heart failure"
        case .leftSided: return "Left-sided heart failure"
        case .atRisk: return "At risk or undiagnosed"
        }
    }

    /// Priority metrics for this HF type (used by risk engine and UI).
    var priorityMetrics: [MetricType] {
        switch self {
        case .hfref:
            return [.heartRate, .hrv, .respiratoryRate, .weight, .sleep]
        case .hfpef:
            return [.steps, .symptoms, .heartRate, .sleep]
        case .rightSided:
            return [.weight, .steps, .heartRate, .edema]
        case .leftSided:
            return [.respiratoryRate, .heartRate, .sleep, .symptoms]
        case .atRisk:
            return [.heartRate, .hrv, .weight, .steps, .sleep]
        }
    }
}

enum MetricType: String, CaseIterable, Codable {
    case heartRate
    case hrv
    case respiratoryRate
    case steps
    case sleep
    case weight
    case symptoms
    case edema
    case irregularRhythm
}
