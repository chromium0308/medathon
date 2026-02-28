//
//  OnboardingContainerView.swift
//  CardioGuard
//

import SwiftUI

struct OnboardingContainerView: View {
    @EnvironmentObject var appState: AppState
    @State private var step: OnboardingStep = .heartFailureType
    @State private var profile = UserProfile()
    @State private var selectedMedicationIds: Set<String> = []

    enum OnboardingStep: Int, CaseIterable {
        case heartFailureType
        case medications
        case baselineVitals
        case healthKit
        case complete
    }

    var body: some View {
        VStack(spacing: 0) {
            ProgressView(value: Double(step.rawValue + 1), total: Double(OnboardingStep.complete.rawValue + 1))
                .tint(Color.cardioRed)
                .padding()

            Group {
                switch step {
                case .heartFailureType:
                    OnboardingHFTypeView(selected: $profile.heartFailureType) {
                        advance()
                    }
                case .medications:
                    OnboardingMedicationsView(selectedIds: $selectedMedicationIds) {
                        profile.medicationIds = Array(selectedMedicationIds)
                        advance()
                    }
                case .baselineVitals:
                    OnboardingBaselineView(profile: $profile) {
                        advance()
                    }
                case .healthKit:
                    OnboardingHealthKitView {
                        advance()
                    }
                case .complete:
                    OnboardingCompleteView {
                        ProfileStore.shared.save(profile)
                        appState.completeOnboarding()
                    }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            if step != .complete {
                HStack {
                    if step.rawValue > 0 {
                        Button("Back") {
                            step = OnboardingStep(rawValue: step.rawValue - 1) ?? .heartFailureType
                        }
                        .foregroundColor(.cardioRed)
                    }
                    Spacer()
                }
                .padding()
            }
        }
        .background(Color(.systemBackground))
    }

    private func advance() {
        withAnimation {
            if step == .complete {
                return
            }
            step = OnboardingStep(rawValue: step.rawValue + 1) ?? .complete
        }
    }
}
