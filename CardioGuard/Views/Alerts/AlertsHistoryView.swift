//
//  AlertsHistoryView.swift
//  CardioGuard
//

import SwiftUI

struct AlertsHistoryView: View {
    @EnvironmentObject var appServices: AppServices
    @State private var alerts: [AlertRecord] = []

    private var repository: DataRepository? { appServices.repository }

    var body: some View {
        NavigationStack {
            List {
                if alerts.isEmpty {
                    Text("No alerts yet. You'll see past notifications here.")
                        .foregroundColor(.secondary)
                } else {
                    ForEach(alerts) { alert in
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Image(systemName: alert.wasRedRisk ? "exclamationmark.triangle.fill" : "bell.fill")
                                    .foregroundColor(alert.wasRedRisk ? .cardioRed : .cardioAmber)
                                Text(alert.title)
                                    .font(.headline)
                                Spacer()
                                Text(alert.date, style: .date)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            Text(alert.message)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
            .navigationTitle("Alerts & history")
            .onAppear { load() }
        }
    }

    private func load() {
        alerts = repository?.alertHistory(limit: 100) ?? []
    }
}
