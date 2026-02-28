//
//  Medication.swift
//  CardioGuard
//

import Foundation

/// Known medications that affect monitoring thresholds.
struct Medication: Identifiable, Hashable, Codable {
    let id: String
    let name: String
    let affectsThresholds: MedicationEffect?

    init(id: String, name: String, affectsThresholds: MedicationEffect? = nil) {
        self.id = id
        self.name = name
        self.affectsThresholds = affectsThresholds
    }

    static let searchableList: [Medication] = [
        Medication(id: "digoxin", name: "Digoxin", affectsThresholds: .digoxin),
        Medication(id: "furosemide", name: "Furosemide", affectsThresholds: .diuretic),
        Medication(id: "spironolactone", name: "Spironolactone", affectsThresholds: .aceOrSpironolactone),
        Medication(id: "metoprolol", name: "Metoprolol", affectsThresholds: .betaBlocker),
        Medication(id: "lisinopril", name: "Lisinopril", affectsThresholds: .aceOrSpironolactone),
        Medication(id: "carvedilol", name: "Carvedilol", affectsThresholds: .betaBlocker),
        Medication(id: "bisoprolol", name: "Bisoprolol", affectsThresholds: .betaBlocker),
        Medication(id: "beta_blockers", name: "Other Beta-blockers", affectsThresholds: .betaBlocker),
        Medication(id: "ace_inhibitors", name: "Other ACE inhibitors", affectsThresholds: .aceOrSpironolactone),
        Medication(id: "other", name: "Other", affectsThresholds: nil),
    ]
}

enum MedicationEffect: String, Codable, Hashable {
    case betaBlocker       // Lower baseline HR — adjust HR thresholds down
    case diuretic          // Weight gain alert sooner (>1.5 kg in 2 days)
    case digoxin           // Flag bradycardia <50 BPM high priority
    case aceOrSpironolactone // Hyperkalemia risk in symptom prompts
}
