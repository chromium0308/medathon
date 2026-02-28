//
//  AppState.swift
//  CardioGuard
//

import SwiftUI
import Combine

/// Global app state: onboarding completion and user profile summary for UI.
final class AppState: ObservableObject {
    @Published var hasCompletedOnboarding: Bool {
        didSet { UserDefaults.standard.set(hasCompletedOnboarding, forKey: Keys.onboardingCompleted) }
    }

    init() {
        self.hasCompletedOnboarding = UserDefaults.standard.bool(forKey: Keys.onboardingCompleted)
    }

    func completeOnboarding() {
        hasCompletedOnboarding = true
    }

    private enum Keys {
        static let onboardingCompleted = "cardioGuard.onboardingCompleted"
    }
}
