//
//  SettingsView.swift
//  CardioGuard
//

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var appServices: AppServices
    @EnvironmentObject var appState: AppState
    @State private var profile: UserProfile?
    @State private var editingProfile = UserProfile()
    @State private var showHFType = false
    @State private var showMeds = false
    @State private var showBaseline = false
    @State private var notificationsOn = true
    @State private var webDashboardURL: String = ""
    @State private var displayedSyncCode: String = ""
    @State private var syncError: String?
    @State private var isSyncing = false

    var body: some View {
        NavigationStack {
            List {
                Section("Web dashboard") {
                    TextField("Dashboard URL", text: $webDashboardURL)
                        .textContentType(.URL)
                        .keyboardType(.URL)
                        .autocapitalization(.none)
                        .onChange(of: webDashboardURL) { newValue in
                            SyncService.shared.baseURL = newValue
                        }
                    if !displayedSyncCode.isEmpty {
                        LabeledContent("Sync code", value: displayedSyncCode)
                            .textSelection(.enabled)
                    }
                    if let err = syncError {
                        Text(err)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                    Button {
                        syncNow()
                    } label: {
                        if isSyncing {
                            HStack {
                                ProgressView()
                                Text("Syncing…")
                            }
                        } else {
                            Text("Sync now")
                        }
                    }
                    .disabled(isSyncing || webDashboardURL.trimmingCharacters(in: .whitespaces).isEmpty)
                }
                Section("Profile") {
                    if let p = profile {
                        LabeledContent("HF type", value: p.heartFailureType.displayName)
                            .onTapGesture { showHFType = true }
                        LabeledContent("Medications", value: "\(p.medicationIds.count) selected")
                            .onTapGesture { showMeds = true }
                        LabeledContent("Baseline HR", value: p.baselineRestingHR.map { "\(Int($0)) bpm" } ?? "Not set")
                        LabeledContent("Baseline weight", value: p.baselineWeightKg.map { String(format: "%.1f kg", $0) } ?? "Not set")
                            .onTapGesture { showBaseline = true }
                    }
                }
                Section("Notifications") {
                    Toggle("Alert notifications", isOn: $notificationsOn)
                }
                Section {
                    Button("Reset onboarding", role: .destructive) {
                        appServices.profileStore.clear()
                        appServices.stopBackgroundPolling()
                        appState.hasCompletedOnboarding = false
                    }
                }
            }
            .navigationTitle("Settings")
            .onAppear {
                profile = appServices.profileStore.load()
                webDashboardURL = SyncService.shared.baseURL
                displayedSyncCode = SyncService.shared.syncCode ?? ""
            }
            .sheet(isPresented: $showHFType) {
                SettingsHFTypeSheet(profile: $editingProfile) {
                    ProfileStore.shared.save(editingProfile)
                    profile = appServices.profileStore.load()
                    showHFType = false
                }
                .onAppear { editingProfile = profile ?? UserProfile() }
            }
            .sheet(isPresented: $showMeds) {
                SettingsMedsSheet(profile: $editingProfile) {
                    ProfileStore.shared.save(editingProfile)
                    profile = appServices.profileStore.load()
                    showMeds = false
                }
                .onAppear { editingProfile = profile ?? UserProfile() }
            }
            .sheet(isPresented: $showBaseline) {
                SettingsBaselineSheet(profile: $editingProfile) {
                    ProfileStore.shared.save(editingProfile)
                    profile = appServices.profileStore.load()
                    showBaseline = false
                }
                .onAppear { editingProfile = profile ?? UserProfile() }
            }
        }
    }

    private func syncNow() {
        syncError = nil
        isSyncing = true
        Task {
            do {
                if let code = try await appServices.syncToWeb() {
                    await MainActor.run {
                        displayedSyncCode = code
                    }
                } else {
                    await MainActor.run {
                        displayedSyncCode = SyncService.shared.syncCode ?? displayedSyncCode
                    }
                }
            } catch {
                await MainActor.run {
                    syncError = error.localizedDescription
                }
            }
            await MainActor.run {
                isSyncing = false
            }
        }
    }
}

// Minimal edit sheets for Settings (reuse onboarding-style content if desired)
struct SettingsHFTypeSheet: View {
    @Binding var profile: UserProfile
    var onDismiss: () -> Void

    var body: some View {
        NavigationStack {
            List(HeartFailureType.allCases) { type in
                Button {
                    profile.heartFailureType = type
                    onDismiss()
                } label: {
                    HStack {
                        Text(type.displayName)
                        if profile.heartFailureType == type {
                            Spacer()
                            Image(systemName: "checkmark")
                                .foregroundColor(.cardioRed)
                        }
                    }
                }
            }
            .navigationTitle("HF type")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") { onDismiss() }
                }
            }
        }
    }
}

struct SettingsMedsSheet: View {
    @Binding var profile: UserProfile
    var onDismiss: () -> Void

    @State private var selectedIds: Set<String> = []

    var body: some View {
        NavigationStack {
            List {
                ForEach(Medication.searchableList) { med in
                    Button {
                        if selectedIds.contains(med.id) {
                            selectedIds.remove(med.id)
                        } else {
                            selectedIds.insert(med.id)
                        }
                    } label: {
                        HStack {
                            Text(med.name)
                            if selectedIds.contains(med.id) {
                                Spacer()
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.cardioRed)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Medications")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") {
                        profile.medicationIds = Array(selectedIds)
                        onDismiss()
                    }
                }
            }
            .onAppear {
                selectedIds = Set(profile.medicationIds)
            }
        }
    }
}

struct SettingsBaselineSheet: View {
    @Binding var profile: UserProfile
    var onDismiss: () -> Void

    @State private var restingHRText = ""
    @State private var weightText = ""

    var body: some View {
        NavigationStack {
            Form {
                TextField("Resting HR (bpm)", text: $restingHRText)
                    .keyboardType(.numberPad)
                TextField("Weight (kg)", text: $weightText)
                    .keyboardType(.decimalPad)
            }
            .navigationTitle("Baseline vitals")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { onDismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        profile.baselineRestingHR = Double(restingHRText)
                        profile.baselineWeightKg = Double(weightText.replacingOccurrences(of: ",", with: "."))
                        onDismiss()
                    }
                }
            }
            .onAppear {
                if let hr = profile.baselineRestingHR { restingHRText = "\(Int(hr))" }
                if let w = profile.baselineWeightKg { weightText = String(format: "%.1f", w) }
            }
        }
    }
}
