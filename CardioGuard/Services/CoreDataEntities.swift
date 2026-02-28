//
//  CoreDataEntities.swift
//  CardioGuard
//

import CoreData

@objc(HealthMetricEntity)
public class HealthMetricEntity: NSManagedObject {
    @NSManaged public var id: UUID?
    @NSManaged public var date: Date?
    @NSManaged public var metricType: String?
    @NSManaged public var value: Double
    @NSManaged public var unit: String?
}

@objc(SymptomLogEntity)
public class SymptomLogEntity: NSManagedObject {
    @NSManaged public var id: UUID?
    @NSManaged public var date: Date?
    @NSManaged public var payloadJSON: String?
}

@objc(AlertHistoryEntity)
public class AlertHistoryEntity: NSManagedObject {
    @NSManaged public var id: UUID?
    @NSManaged public var date: Date?
    @NSManaged public var kindRaw: String?
    @NSManaged public var title: String?
    @NSManaged public var message: String?
    @NSManaged public var wasRedRisk: Bool
}

