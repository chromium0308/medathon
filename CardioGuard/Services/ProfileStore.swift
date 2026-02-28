//
//  ProfileStore.swift
//  CardioGuard
//

import Foundation

/// Stores and retrieves UserProfile from UserDefaults.
final class ProfileStore {
    static let shared = ProfileStore()
    private let key = "cardioGuard.userProfile"
    private let defaults = UserDefaults.standard
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()

    func load() -> UserProfile? {
        guard let data = defaults.data(forKey: key) else { return nil }
        return try? decoder.decode(UserProfile.self, from: data)
    }

    func save(_ profile: UserProfile) {
        guard let data = try? encoder.encode(profile) else { return }
        defaults.set(data, forKey: key)
    }

    func clear() {
        defaults.removeObject(forKey: key)
    }
}
