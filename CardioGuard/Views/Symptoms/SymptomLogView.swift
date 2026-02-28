//
//  SymptomLogView.swift
//  CardioGuard
//

import SwiftUI

struct SymptomLogView: View {
    @EnvironmentObject var appServices: AppServices
    @State private var history: [SymptomEntry] = []
    @State private var showSheet = false
    @State private var selectedDate = Date()

    private var repository: DataRepository? { appServices.repository }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Button {
                        selectedDate = Date()
                        showSheet = true
                    } label: {
                        Label("Log today's symptoms", systemImage: "plus.circle.fill")
                    }
                }
                Section("Recent entries") {
                    if history.isEmpty {
                        Text("No entries yet. Tap above to add today's check-in.")
                            .foregroundColor(.secondary)
                    } else {
                        ForEach(history) { entry in
                            SymptomRow(entry: entry) {
                                selectedDate = entry.date
                                showSheet = true
                            }
                        }
                    }
                }
            }
            .navigationTitle("Symptom log")
            .onAppear { loadHistory() }
            .sheet(isPresented: $showSheet) {
                if let repo = repository {
                    let existing = repo.symptomEntry(for: selectedDate)
                    DailySymptomSheet(
                        date: selectedDate,
                        existing: existing,
                        onSave: { entry in
                            repo.saveSymptomEntry(entry)
                            appServices.evaluateRiskAndAlerts()
                            loadHistory()
                            showSheet = false
                        },
                        onDismiss: { showSheet = false }
                    )
                }
            }
        }
    }

    private func loadHistory() {
        guard let repo = repository else { return }
        let end = Date()
        let start = Calendar.current.date(byAdding: .day, value: -90, to: end) ?? end
        history = repo.symptomEntries(from: start, to: end)
    }
}

struct SymptomRow: View {
    let entry: SymptomEntry
    let onTap: () -> Void

    private var dateStr: String {
        let f = DateFormatter()
        f.dateStyle = .medium
        return f.string(from: entry.date)
    }

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 4) {
                Text(dateStr)
                    .font(.headline)
                Text("SOB: \(entry.shortnessOfBreath.rawValue), Fatigue: \(entry.fatigueLevel), Sleep: \(entry.sleepQuality.rawValue)")
                    .font(.caption)
                    .foregroundColor(.secondary)
                if entry.ankleSwelling || entry.dizzinessOrPalpitations {
                    Text([entry.ankleSwelling ? "Swelling" : nil, entry.dizzinessOrPalpitations ? "Dizziness/palpitations" : nil].compactMap { $0 }.joined(separator: ", "))
                        .font(.caption2)
                        .foregroundColor(.orange)
                }
            }
            .padding(.vertical, 4)
        }
    }
}
