//
//  AlertRecord.swift
//  CardioGuard
//

import Foundation

/// A single alert that was shown to the user (stored for history).
struct AlertRecord: Identifiable, Codable {
    var id: UUID
    var date: Date
    var kind: AlertKind
    var title: String
    var message: String
    var wasRedRisk: Bool  // Red risk score triggered

    init(id: UUID = UUID(), date: Date = Date(), kind: AlertKind, title: String, message: String, wasRedRisk: Bool = false) {
        self.id = id
        self.date = date
        self.kind = kind
        self.title = title
        self.message = message
        self.wasRedRisk = wasRedRisk
    }
}

enum AlertKind: String, Codable {
    case redRiskScore = "Red risk score"
    case bradycardia = "Bradycardia"
    case tachycardia = "Tachycardia"
    case weightGain = "Weight gain"
    case irregularRhythm = "Irregular heart rhythm"
    case decliningActivity = "Declining activity"
    case hrvDecline = "HRV decline"
    case elevatedRR = "Elevated respiratory rate"
    case symptomPattern = "Symptom pattern"
    case other = "Other"
}
