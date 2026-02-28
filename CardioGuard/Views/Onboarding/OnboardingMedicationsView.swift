//
//  OnboardingMedicationsView.swift
//  CardioGuard
//

import SwiftUI

struct OnboardingMedicationsView: View {
    @Binding var selectedIds: Set<String>
    @State private var searchText = ""
    var onContinue: () -> Void

    private var filteredMeds: [Medication] {
        if searchText.isEmpty { return Medication.searchableList }
        return Medication.searchableList.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Current medications")
                    .font(.title)
                    .fontWeight(.semibold)
                Text("Select all heart failure–related medications you take. This adjusts alert thresholds.")
                    .font(.body)
                    .foregroundColor(.secondary)

                TextField("Search medications", text: $searchText)
                    .textFieldStyle(.roundedBorder)
                    .autocapitalization(.none)

                ForEach(filteredMeds) { med in
                    Button {
                        if selectedIds.contains(med.id) {
                            selectedIds.remove(med.id)
                        } else {
                            selectedIds.insert(med.id)
                        }
                    } label: {
                        HStack {
                            Image(systemName: selectedIds.contains(med.id) ? "checkmark.square.fill" : "square")
                                .foregroundColor(selectedIds.contains(med.id) ? .cardioRed : .gray)
                            Text(med.name)
                                .foregroundColor(.primary)
                            if med.affectsThresholds != nil {
                                Text("•")
                                    .foregroundColor(.secondary)
                            }
                            Spacer()
                        }
                        .padding(.vertical, 8)
                        .padding(.horizontal, 12)
                        .background(Color(.secondarySystemBackground))
                        .cornerRadius(8)
                    }
                    .buttonStyle(.plain)
                }

                Button("Continue") {
                    onContinue()
                }
                .buttonStyle(.borderedProminent)
                .tint(.cardioRed)
                .controlSize(.large)
                .padding(.top, 16)
            }
            .padding()
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}
