//
//  OnboardingBaselineView.swift
//  CardioGuard
//

import SwiftUI

struct OnboardingBaselineView: View {
    @Binding var profile: UserProfile
    var onContinue: () -> Void

    @State private var restingHRText = ""
    @State private var weightText = ""
    @State private var ageText = ""
    @State private var hasCKD = false
    @State private var hasDiabetes = false
    @State private var hasHypertension = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Text("Baseline & health")
                    .font(.title)
                    .fontWeight(.semibold)
                Text("Optional: enter your typical resting heart rate and weight so we can personalize alerts.")

                VStack(alignment: .leading, spacing: 8) {
                    Text("Resting heart rate (bpm)")
                        .font(.subheadline)
                    TextField("e.g. 72", text: $restingHRText)
                        .keyboardType(.numberPad)
                        .textFieldStyle(.roundedBorder)
                }

                VStack(alignment: .leading, spacing: 8) {
                    Text("Weight (kg)")
                        .font(.subheadline)
                    TextField("e.g. 75", text: $weightText)
                        .keyboardType(.decimalPad)
                        .textFieldStyle(.roundedBorder)
                }

                VStack(alignment: .leading, spacing: 8) {
                    Text("Age")
                        .font(.subheadline)
                    TextField("e.g. 65", text: $ageText)
                        .keyboardType(.numberPad)
                        .textFieldStyle(.roundedBorder)
                }

                VStack(alignment: .leading, spacing: 8) {
                    Text("Relevant conditions")
                        .font(.subheadline)
                    Toggle("Chronic kidney disease (CKD)", isOn: $hasCKD)
                    Toggle("Diabetes", isOn: $hasDiabetes)
                    Toggle("Hypertension", isOn: $hasHypertension)
                }

                Picker("Activity level", selection: $profile.activityLevel) {
                    ForEach(ActivityLevel.allCases) { level in
                        Text(level.rawValue).tag(level)
                    }
                }
                .pickerStyle(.menu)

                Button("Continue") {
                    profile.baselineRestingHR = Double(restingHRText.replacingOccurrences(of: ",", with: "."))
                    profile.baselineWeightKg = Double(weightText.replacingOccurrences(of: ",", with: "."))
                    profile.age = Int(ageText)
                    profile.hasCKD = hasCKD
                    profile.hasDiabetes = hasDiabetes
                    profile.hasHypertension = hasHypertension
                    onContinue()
                }
                .buttonStyle(.borderedProminent)
                .tint(.cardioRed)
                .controlSize(.large)
                .padding(.top, 8)
            }
            .padding()
        }
        .onAppear {
            if let hr = profile.baselineRestingHR { restingHRText = "\(Int(hr))" }
            if let w = profile.baselineWeightKg { weightText = String(format: "%.1f", w) }
            if let a = profile.age { ageText = "\(a)" }
            hasCKD = profile.hasCKD
            hasDiabetes = profile.hasDiabetes
            hasHypertension = profile.hasHypertension
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}
