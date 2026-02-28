//
//  HomeDashboardView.swift
//  CardioGuard
//

import SwiftUI
import Charts

struct HomeDashboardView: View {
    @EnvironmentObject var appServices: AppServices
    @Environment(\.managedObjectContext) private var viewContext
    @State private var riskScore: Double = 0
    @State private var riskLevel: RiskLevel = .green
    @State private var liveHR: Double?
    @State private var liveHRV: Double?
    @State private var weightSamples: [HealthMetricSample] = []
    @State private var stepSamples: [HealthMetricSample] = []
    @State private var todaySymptom: SymptomEntry?
    @State private var isLoading = true
    @State private var showSymptomSheet = false

    private var profile: UserProfile? { appServices.profileStore.load() }
    private var repository: DataRepository? { appServices.repository }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    riskGaugeCard
                    liveMetricsCard
                    weightTrendCard
                    activityTrendCard
                    symptomCheckInCard
                }
                .padding()
            }
            .navigationTitle("CardioGuard")
            .background(Color(.systemGroupedBackground))
            .refreshable { await refresh() }
            .onAppear {
                Task { await refresh() }
            }
            .sheet(isPresented: $showSymptomSheet) {
                if let repo = repository {
                    DailySymptomSheet(
                        date: Date(),
                        existing: todaySymptom,
                        onSave: { entry in
                            repo.saveSymptomEntry(entry)
                            todaySymptom = entry
                            appServices.evaluateRiskAndAlerts()
                            showSymptomSheet = false
                        },
                        onDismiss: { showSymptomSheet = false }
                    )
                }
            }
        }
    }

    private var riskGaugeCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Today's risk score")
                .font(.headline)
            HStack(alignment: .bottom, spacing: 16) {
                ZStack {
                    Circle()
                        .trim(from: 0, to: CGFloat(riskScore / 100))
                        .stroke(riskLevel.color, style: StrokeStyle(lineWidth: 14, lineCap: .round))
                        .rotationEffect(.degrees(-90))
                        .frame(width: 100, height: 100)
                    Text("\(Int(riskScore))")
                        .font(.title)
                        .fontWeight(.bold)
                }
                .accessibilityLabel("Risk score \(Int(riskScore)), \(riskLevel.label)")
                VStack(alignment: .leading, spacing: 4) {
                    Text(riskLevel.label)
                        .font(.headline)
                        .foregroundColor(riskLevel.color)
                    Text(riskLevel.shortMessage)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                Spacer()
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
        }
    }

    private var liveMetricsCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Live from Apple Watch")
                .font(.headline)
            HStack(spacing: 24) {
                liveMetric(value: liveHR, unit: "bpm", label: "Heart rate", icon: "heart.fill")
                liveMetric(value: liveHRV, unit: "ms", label: "HRV", icon: "waveform.path.ecg")
            }
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color(.systemBackground))
            .cornerRadius(12)
        }
    }

    private func liveMetric(value: Double?, unit: String, label: String, icon: String) -> some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(.cardioRed)
            Text(value.map { String(format: "%.0f", $0) } ?? "—")
                .font(.title2)
                .fontWeight(.semibold)
            Text("\(label) (\(unit))")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
    }

    private var weightTrendCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Weight (7 days)")
                .font(.headline)
            if weightSamples.isEmpty {
                Text("No weight data yet")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity)
                    .padding()
            } else {
                Chart(aggregateByDay(weightSamples).map { ChartPoint(id: $0.date, date: $0.date, value: $0.value) }) { item in
                    LineMark(
                        x: .value("Day", item.date),
                        y: .value("kg", item.value)
                    )
                    .foregroundStyle(Color.cardioRed)
                }
                .frame(height: 120)
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
        }
    }

    private var activityTrendCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Activity (7 days)")
                .font(.headline)
            if stepSamples.isEmpty {
                Text("No step data yet")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity)
                    .padding()
            } else {
                Chart(aggregateByDay(stepSamples).map { ChartPoint(id: $0.date, date: $0.date, value: $0.value) }) { item in
                    BarMark(
                        x: .value("Day", item.date),
                        y: .value("Steps", item.value)
                    )
                    .foregroundStyle(Color.cardioGreen)
                }
                .frame(height: 120)
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
        }
    }

    private var symptomCheckInCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Daily symptom check-in")
                .font(.headline)
            if let _ = todaySymptom {
                Text("Completed today")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            Button {
                showSymptomSheet = true
            } label: {
                Label(todaySymptom == nil ? "Log today's symptoms" : "Update today's symptoms", systemImage: "list.clipboard")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .tint(.cardioRed)
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
        }
    }

    private func aggregateByDay(_ samples: [HealthMetricSample]) -> [(date: Date, value: Double)] {
        let byDay = Dictionary(grouping: samples, by: { Calendar.current.startOfDay(for: $0.date) })
        return byDay.map { (date: $0.key, value: $0.value.reduce(0) { $0 + $1.value }) }
            .sorted { $0.date < $1.date }
    }

    private func refresh() async {
        guard let profile = profile, let repo = repository else {
            isLoading = false
            return
        }
        let end = Date()
        let start7 = Calendar.current.date(byAdding: .day, value: -7, to: end) ?? end
        let start30 = Calendar.current.date(byAdding: .day, value: -30, to: end) ?? end
        let metrics = repo.allMetrics(from: start30, to: end)
        let symptoms = repo.symptomEntries(from: start30, to: end)
        let engine = RiskScoringEngine(profile: profile, metrics: metrics, symptomEntries: symptoms, alertDates: [])
        let (score, level) = engine.computeDailyScore(date: end)
        await MainActor.run {
            riskScore = score
            riskLevel = level
            weightSamples = repo.metrics(from: start7, to: end, type: .weight)
            stepSamples = repo.metrics(from: start7, to: end, type: .steps)
            todaySymptom = repo.symptomEntry(for: end)
        }
        let hr = await appServices.healthKit.fetchLatestHeartRate()
        let hrv = await appServices.healthKit.fetchLatestHRV()
        await MainActor.run {
            liveHR = hr
            liveHRV = hrv
            isLoading = false
        }
    }
}

struct ChartPoint: Identifiable {
    let id: Date
    let date: Date
    let value: Double
}

// MARK: - Daily symptom sheet

struct DailySymptomSheet: View {
    let date: Date
    let existing: SymptomEntry?
    let onSave: (SymptomEntry) -> Void
    let onDismiss: () -> Void

    @State private var shortnessOfBreath: ShortnessOfBreathLevel = .none
    @State private var fatigueLevel: Int = 1
    @State private var ankleSwelling = false
    @State private var dizzinessOrPalpitations = false
    @State private var sleepQuality: SleepQuality = .good

    var body: some View {
        NavigationStack {
            Form {
                Section("Shortness of breath") {
                    Picker("Level", selection: $shortnessOfBreath) {
                        ForEach(ShortnessOfBreathLevel.allCases) { level in
                            Text(level.rawValue).tag(level)
                        }
                    }
                    .pickerStyle(.menu)
                }
                Section("Fatigue (1 = minimal, 5 = severe)") {
                    Picker("Level", selection: $fatigueLevel) {
                        ForEach(1...5, id: \.self) { n in
                            Text("\(n)").tag(n)
                        }
                    }
                    .pickerStyle(.segmented)
                }
                Section("Other") {
                    Toggle("Ankle/leg swelling", isOn: $ankleSwelling)
                    Toggle("Dizziness or palpitations", isOn: $dizzinessOrPalpitations)
                }
                Section("Sleep") {
                    Picker("Quality", selection: $sleepQuality) {
                        ForEach(SleepQuality.allCases) { q in
                            Text(q.rawValue).tag(q)
                        }
                    }
                    .pickerStyle(.menu)
                }
            }
            .navigationTitle("Today's symptoms")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { onDismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        let entry = SymptomEntry(
                            id: existing?.id ?? UUID(),
                            date: date,
                            shortnessOfBreath: shortnessOfBreath,
                            fatigueLevel: fatigueLevel,
                            ankleSwelling: ankleSwelling,
                            dizzinessOrPalpitations: dizzinessOrPalpitations,
                            sleepQuality: sleepQuality
                        )
                        onSave(entry)
                    }
                }
            }
            .onAppear {
                if let e = existing {
                    shortnessOfBreath = e.shortnessOfBreath
                    fatigueLevel = e.fatigueLevel
                    ankleSwelling = e.ankleSwelling
                    dizzinessOrPalpitations = e.dizzinessOrPalpitations
                    sleepQuality = e.sleepQuality
                }
            }
        }
    }
}
