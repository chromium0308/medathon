//
//  ContentView.swift
//  CardioGuard
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        Group {
            if appState.hasCompletedOnboarding {
                MainTabView()
            } else {
                OnboardingContainerView()
            }
        }
        .animation(.easeInOut, value: appState.hasCompletedOnboarding)
    }
}

struct MainTabView: View {
    @EnvironmentObject var appServices: AppServices

    var body: some View {
        TabView {
            HomeDashboardView()
                .tabItem {
                    Label("Home", systemImage: "heart.fill")
                }
            TrendsView()
                .tabItem {
                    Label("Trends", systemImage: "chart.xyaxis.line")
                }
            SymptomLogView()
                .tabItem {
                    Label("Symptoms", systemImage: "list.clipboard")
                }
            MedicationsView()
                .tabItem {
                    Label("Medications", systemImage: "pills.fill")
                }
            AlertsHistoryView()
                .tabItem {
                    Label("Alerts", systemImage: "bell.badge.fill")
                }
            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gearshape.fill")
                }
        }
        .tint(Color.cardioRed)
        .onAppear {
            appServices.startBackgroundPolling()
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(AppState())
}
