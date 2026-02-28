//
//  OnboardingCompleteView.swift
//  CardioGuard
//

import SwiftUI

struct OnboardingCompleteView: View {
    var onFinish: () -> Void

    var body: some View {
        VStack(spacing: 32) {
            Spacer()
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 70))
                .foregroundColor(.cardioGreen)
            Text("You're all set")
                .font(.title)
                .fontWeight(.bold)
            Text("CardioGuard will monitor your metrics and alert you when something needs attention. Check the Home tab for your daily risk score.")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            Spacer()
            Button("Get started") {
                onFinish()
            }
            .buttonStyle(.borderedProminent)
            .tint(.cardioRed)
            .controlSize(.large)
            .padding(.horizontal, 40)
            .padding(.bottom, 40)
        }
    }
}
