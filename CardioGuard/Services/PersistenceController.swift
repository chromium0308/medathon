//
//  PersistenceController.swift
//  CardioGuard
//

import CoreData

final class PersistenceController {
    static let shared = PersistenceController()

    let container: NSPersistentContainer

    var viewContext: NSManagedObjectContext { container.viewContext }

    init(inMemory: Bool = false) {
        container = NSPersistentContainer(name: "CardioGuardModel", managedObjectModel: Self.buildModel())
        // Use programmatic model; default store URL from container

        let storeURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
            .appendingPathComponent("CardioGuardModel.sqlite")
        container.persistentStoreDescriptions = [
            NSPersistentStoreDescription(url: inMemory ? URL(fileURLWithPath: "/dev/null") : storeURL)
        ]

        container.loadPersistentStores { _, error in
            if let error = error as NSError? {
                fatalError("Core Data load failed: \(error), \(error.userInfo)")
            }
        }
        container.viewContext.automaticallyMergesChangesFromParent = true
        container.viewContext.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy
    }

    private static func buildModel() -> NSManagedObjectModel {
        let model = NSManagedObjectModel()

        let metricEntity = NSEntityDescription()
        metricEntity.name = "HealthMetricEntity"
        metricEntity.managedObjectClassName = "CardioGuard.HealthMetricEntity"
        metricEntity.properties = [
            NSAttributeDescription(name: "id", attributeType: .UUIDAttributeType),
            NSAttributeDescription(name: "date", attributeType: .dateAttributeType),
            NSAttributeDescription(name: "metricType", attributeType: .stringAttributeType),
            NSAttributeDescription(name: "value", attributeType: .doubleAttributeType),
            NSAttributeDescription(name: "unit", attributeType: .stringAttributeType),
        ]

        let symptomEntity = NSEntityDescription()
        symptomEntity.name = "SymptomLogEntity"
        symptomEntity.managedObjectClassName = "CardioGuard.SymptomLogEntity"
        symptomEntity.properties = [
            NSAttributeDescription(name: "id", attributeType: .UUIDAttributeType),
            NSAttributeDescription(name: "date", attributeType: .dateAttributeType),
            NSAttributeDescription(name: "payloadJSON", attributeType: .stringAttributeType),
        ]

        let alertEntity = NSEntityDescription()
        alertEntity.name = "AlertHistoryEntity"
        alertEntity.managedObjectClassName = "CardioGuard.AlertHistoryEntity"
        alertEntity.properties = [
            NSAttributeDescription(name: "id", attributeType: .UUIDAttributeType),
            NSAttributeDescription(name: "date", attributeType: .dateAttributeType),
            NSAttributeDescription(name: "kindRaw", attributeType: .stringAttributeType),
            NSAttributeDescription(name: "title", attributeType: .stringAttributeType),
            NSAttributeDescription(name: "message", attributeType: .stringAttributeType),
            NSAttributeDescription(name: "wasRedRisk", attributeType: .booleanAttributeType),
        ]

        model.entities = [metricEntity, symptomEntity, alertEntity]
        return model
    }

    func save() {
        let ctx = viewContext
        guard ctx.hasChanges else { return }
        do {
            try ctx.save()
        } catch {
            let ns = error as NSError
            print("Core Data save error: \(ns), \(ns.userInfo)")
        }
    }
}
