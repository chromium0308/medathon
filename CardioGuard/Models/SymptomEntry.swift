//
//  SymptomEntry.swift
//  CardioGuard
//

import Foundation

/// Single daily symptom check-in.
struct SymptomEntry: Identifiable, Codable {
    var id: UUID
    var date: Date
    var shortnessOfBreath: ShortnessOfBreathLevel
    var fatigueLevel: Int  // 1–5
    var ankleSwelling: Bool
    var dizzinessOrPalpitations: Bool
    var sleepQuality: SleepQuality

    init(
        id: UUID = UUID(),
        date: Date = Date(),
        shortnessOfBreath: ShortnessOfBreathLevel = .none,
        fatigueLevel: Int = 1,
        ankleSwelling: Bool = false,
        dizzinessOrPalpitations: Bool = false,
        sleepQuality: SleepQuality = .good
    ) {
        self.id = id
        self.date = date
        self.shortnessOfBreath = shortnessOfBreath
        self.fatigueLevel = min(5, max(1, fatigueLevel))
        self.ankleSwelling = ankleSwelling
        self.dizzinessOrPalpitations = dizzinessOrPalpitations
        self.sleepQuality = sleepQuality
    }

    /// Composite symptom score 0–100 (higher = worse).
    var compositeScore: Double {
        let sobScore: Double = {
            switch shortnessOfBreath {
            case .none: return 0
            case .mild: return 15
            case .moderate: return 35
            case .severe: return 55
            }
        }()
        let fatigueScore = Double(fatigueLevel - 1) / 4.0 * 25
        let swellingScore = ankleSwelling ? 10.0 : 0
        let dizzyScore = dizzinessOrPalpitations ? 5.0 : 0
        let sleepScore: Double = {
            switch sleepQuality {
            case .good: return 0
            case .disturbed: return 3
            case .couldNotLieFlat: return 7
            }
        }()
        return min(100, sobScore + fatigueScore + swellingScore + dizzyScore + sleepScore)
    }
}

enum ShortnessOfBreathLevel: String, CaseIterable, Identifiable, Codable {
    case none = "None"
    case mild = "Mild"
    case moderate = "Moderate"
    case severe = "Severe"

    var id: String { rawValue }
}

enum SleepQuality: String, CaseIterable, Identifiable, Codable {
    case good = "Good"
    case disturbed = "Disturbed"
    case couldNotLieFlat = "Couldn't lie flat"

    var id: String { rawValue }
}
