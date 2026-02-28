//
//  TrendsView.swift
//  CardioGuard
//

import SwiftUI
import Charts

struct TrendsView: View {
    @EnvironmentObject var appServices: AppServices
    @State private var period: TrendPeriod = .days7
    @State private var metrics: [HealthMetricSample] = []
    @State private var alertDates: [Date] = []
    @State private var selectedMetric: MetricType = .heartRate

    enum TrendPeriod: String, CaseIterable {
        case days7 = "7 days"
        case days30 = "30 days"
        case days90 = "90 days"
    }

    private var repository: DataRepository? { appServices.repository }
    private var dayCount: Int {
        switch period {
        case .days7: return 7
        case .days30: return 30
        case .days90: return 90
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Picker("Period", selection: $period) {
                        ForEach([TrendPeriod.days7, .days30, .days90], id: \.self) { p in
                            Text(p.rawValue).tag(p)
                        }
                    }
                    .pickerStyle(.segmented)
                    .onChange(of: period) { _ in load() }

                    Picker("Metric", selection: $selectedMetric) {
                        ForEach(MetricType.allHealth, id: \.self) { m in
                            Text(metricLabel(m)).tag(m)
                        }
                    }
                    .pickerStyle(.menu)
                    .onChange(of: selectedMetric) { _ in load() }

                    if metrics.isEmpty {
                        Text("No data for this period")
                            .foregroundColor(.secondary)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 40)
                    } else {
                        let points = aggregateByDay(metrics).map { ChartPoint(id: $0.date, date: $0.date, value: $0.value) }
                        Chart(points) { item in
                            LineMark(
                                x: .value("Day", item.date),
                                y: .value("Value", item.value)
                            )
                            .foregroundStyle(metricColor(selectedMetric))
                        }
                        .frame(height: 200)
                    }
                }
                .padding()
            }
            .navigationTitle("Trends")
            .background(Color(.systemGroupedBackground))
            .onAppear { load() }
        }
    }

    private func load() {
        guard let repo = repository else { return }
        let end = Date()
        let start = Calendar.current.date(byAdding: .day, value: -dayCount, to: end) ?? end
        metrics = repo.metrics(from: start, to: end, type: selectedMetric)
        let alerts = repo.alertHistory(limit: 200)
        alertDates = alerts.map(\.date)
    }

    private func aggregateByDay(_ samples: [HealthMetricSample]) -> [(date: Date, value: Double)] {
        let byDay = Dictionary(grouping: samples, by: { Calendar.current.startOfDay(for: $0.date) })
        return byDay.map { (date: $0.key, value: $0.value.reduce(0) { $0 + $1.value } / Double($0.value.count)) }
            .sorted { $0.date < $1.date }
    }

    private func metricLabel(_ m: MetricType) -> String {
        switch m {
        case .heartRate: return "Heart rate"
        case .hrv: return "HRV"
        case .respiratoryRate: return "Resp. rate"
        case .steps: return "Steps"
        case .sleep: return "Sleep (hr)"
        case .weight: return "Weight"
        default: return m.rawValue
        }
    }

    private func metricColor(_ m: MetricType) -> Color {
        switch m {
        case .heartRate: return .cardioRed
        case .hrv: return .blue
        case .respiratoryRate: return .orange
        case .steps: return .cardioGreen
        case .sleep: return .purple
        case .weight: return .brown
        default: return .gray
        }
    }
}
