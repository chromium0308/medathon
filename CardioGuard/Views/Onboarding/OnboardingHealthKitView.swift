//
//  OnboardingHealthKitView.swift
//  CardioGuard
//

import SwiftUI

struct OnboardingHealthKitView: View {
    @StateObject private var healthKit = HealthKitService()
    @State private var isRequesting = false
    @State private var errorMessage: String?
    var onContinue: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Image(systemName: "heart.text.square.fill")
                    .font(.system(size: 50))
                    .foregroundColor(.cardioRed)
                Text("Connect Apple Watch & Health")
                    .font(.title)
                    .fontWeight(.semibold)
                Text("CardioGuard uses heart rate, HRV, respiratory rate, steps, sleep, and weight from the Health app to monitor your cardiac health. Data stays on your device.")
                    .font(.body)
                    .foregroundColor(.secondary)

                if let msg = errorMessage {
                    Text(msg)
                        .font(.caption)
                        .foregroundColor(.red)
                }

                Button {
                    requestHealthKit()
                } label: {
                    if isRequesting {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .frame(maxWidth: .infinity)
                    } else {
                        Text("Allow Health access")
                            .frame(maxWidth: .infinity)
                    }
                }
                .buttonStyle(.borderedProminent)
                .tint(.cardioRed)
                .controlSize(.large)
                .disabled(isRequesting)

                Button("Continue without Health data") {
                    onContinue()
                }
                .foregroundColor(.secondary)
            }
            .padding()
        }
        .navigationBarTitleDisplayMode(.inline)
    }

    private func requestHealthKit() {
        isRequesting = true
        errorMessage = nil
        Task {
            do {
                try await healthKit.requestAuthorization()
                await MainActor.run {
                    isRequesting = false
                    onContinue()
                }
            } catch {
                await MainActor.run {
                    isRequesting = false
                    errorMessage = "Could not request Health access: \(error.localizedDescription)"
                }
            }
        }
    }
}
