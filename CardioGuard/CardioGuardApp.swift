//
//  CardioGuardApp.swift
//  CardioGuard
//
//  Heart failure risk monitoring with Apple Watch + HealthKit.
//

import SwiftUI

@main
struct CardioGuardApp: App {
    @StateObject private var appState = AppState()
    @StateObject private var appServices = AppServices()
    let persistenceController = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
                .environmentObject(appState)
                .environmentObject(appServices)
                .onAppear {
                    appServices.configure(context: persistenceController.container.viewContext)
                }
        }
    }
}
