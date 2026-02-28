//
//  MedicationsView.swift
//  CardioGuard
//

import SwiftUI

struct MedicationsView: View {
    @EnvironmentObject var appServices: AppServices
    @State private var profile: UserProfile?

    private var currentMeds: [Medication] {
        guard let ids = profile?.medicationIds else { return [] }
        return Medication.searchableList.filter { ids.contains($0.id) }
    }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Text("These medications affect how CardioGuard interprets your metrics and when to alert you.")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                Section("Your medications") {
                    if currentMeds.isEmpty {
                        Text("None selected. Add in Settings.")
                            .foregroundColor(.secondary)
                    } else {
                        ForEach(currentMeds) { med in
                            VStack(alignment: .leading, spacing: 4) {
                                Text(med.name)
                                    .font(.headline)
                                if let effect = med.affectsThresholds {
                                    Text(medicationNote(effect))
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }
            }
            .navigationTitle("Medications")
            .onAppear {
                profile = appServices.profileStore.load()
            }
        }
    }

    private func medicationNote(_ effect: MedicationEffect) -> String {
        switch effect {
        case .betaBlocker:
            return "Lowers expected heart rate — HR alert thresholds are adjusted down."
        case .diuretic:
            return "Weight gain alert triggers sooner (>1.5 kg in 2 days)."
        case .digoxin:
            return "Bradycardia (<50 BPM) is flagged as high priority."
        case .aceOrSpironolactone:
            return "Hyperkalemia risk — watch for symptoms; discuss with your care team."
        }
    }
}
