//
//  RiskLevel.swift
//  CardioGuard
//

import SwiftUI

enum RiskLevel: String, Codable {
    case green  // 0–39
    case yellow // 40–69
    case red    // 70–100

    init(score: Double) {
        switch score {
        case ..<40: self = .green
        case 40..<70: self = .yellow
        default: self = .red
        }
    }

    var color: Color {
        switch self {
        case .green: return Color.cardioGreen
        case .yellow: return Color.cardioAmber
        case .red: return Color.cardioRed
        }
    }

    var label: String {
        switch self {
        case .green: return "Stable"
        case .yellow: return "Monitor"
        case .red: return "Contact cardiologist"
        }
    }

    var shortMessage: String {
        switch self {
        case .green: return "No action needed"
        case .yellow: return "Lifestyle tips shown"
        case .red: return "Urgent alert sent"
        }
    }
}
