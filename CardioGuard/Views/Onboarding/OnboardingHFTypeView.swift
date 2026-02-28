//
//  OnboardingHFTypeView.swift
//  CardioGuard
//

import SwiftUI

struct OnboardingHFTypeView: View {
    @Binding var selected: HeartFailureType
    var onContinue: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Text("Heart failure type")
                    .font(.title)
                    .fontWeight(.semibold)
                Text("Select the type that best describes your condition. This helps us personalize which metrics to monitor.")
                    .font(.body)
                    .foregroundColor(.secondary)

                ForEach(HeartFailureType.allCases) { type in
                    Button {
                        selected = type
                    } label: {
                        HStack(alignment: .top, spacing: 12) {
                            Image(systemName: selected == type ? "checkmark.circle.fill" : "circle")
                                .foregroundColor(selected == type ? .cardioRed : .gray)
                                .font(.title2)
                            VStack(alignment: .leading, spacing: 4) {
                                Text(type.displayName)
                                    .font(.headline)
                                    .foregroundColor(.primary)
                                Text(type.shortDescription)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                    .multilineTextAlignment(.leading)
                            }
                            Spacer()
                        }
                        .padding()
                        .background(selected == type ? Color.cardioRed.opacity(0.1) : Color(.secondarySystemBackground))
                        .cornerRadius(12)
                    }
                    .buttonStyle(.plain)
                }

                Button("Continue") {
                    onContinue()
                }
                .buttonStyle(.borderedProminent)
                .tint(.cardioRed)
                .controlSize(.large)
                .padding(.top, 8)
            }
            .padding()
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}
