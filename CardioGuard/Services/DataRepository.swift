//
//  DataRepository.swift
//  CardioGuard
//

import CoreData
import Foundation

/// Saves and loads health metrics, symptom logs, and alert history from Core Data.
final class DataRepository: ObservableObject {
    private let context: NSManagedObjectContext
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()

    init(context: NSManagedObjectContext) {
        self.context = context
    }

    // MARK: - Health metrics

    func saveMetric(_ sample: HealthMetricSample) {
        let entity = HealthMetricEntity(context: context)
        entity.id = UUID()
        entity.date = sample.date
        entity.metricType = sample.metricType.rawValue
        entity.value = sample.value
        entity.unit = sample.unit
        try? context.save()
    }

    func saveMetrics(_ samples: [HealthMetricSample]) {
        for s in samples {
            let entity = HealthMetricEntity(context: context)
            entity.id = UUID()
            entity.date = s.date
            entity.metricType = s.metricType.rawValue
            entity.value = s.value
            entity.unit = s.unit
        }
        try? context.save()
    }

    func metrics(from start: Date, to end: Date, type: MetricType) -> [HealthMetricSample] {
        let req = HealthMetricEntity.fetchRequest()
        req.predicate = NSPredicate(format: "date >= %@ AND date <= %@ AND metricType == %@", start as NSDate, end as NSDate, type.rawValue)
        req.sortDescriptors = [NSSortDescriptor(keyPath: \HealthMetricEntity.date, ascending: true)]
        req.returnsObjectsAsFaults = false
        guard let entities = try? context.fetch(req) as? [HealthMetricEntity] else { return [] }
        return entities.compactMap { HealthMetricSample(from: $0) }
    }

    func allMetrics(from start: Date, to end: Date) -> [HealthMetricSample] {
        let req = HealthMetricEntity.fetchRequest()
        req.predicate = NSPredicate(format: "date >= %@ AND date <= %@", start as NSDate, end as NSDate)
        req.sortDescriptors = [NSSortDescriptor(keyPath: \HealthMetricEntity.date, ascending: true)]
        req.returnsObjectsAsFaults = false
        guard let entities = try? context.fetch(req) as? [HealthMetricEntity] else { return [] }
        return entities.compactMap { HealthMetricSample(from: $0) }
    }

    // MARK: - Symptom log

    func saveSymptomEntry(_ entry: SymptomEntry) {
        let entity = SymptomLogEntity(context: context)
        entity.id = entry.id
        entity.date = entry.date
        entity.payloadJSON = (try? encoder.encode(entry)).flatMap { String(data: $0, encoding: .utf8) }
        try? context.save()
    }

    func symptomEntries(from start: Date, to end: Date) -> [SymptomEntry] {
        let req = SymptomLogEntity.fetchRequest()
        req.predicate = NSPredicate(format: "date >= %@ AND date <= %@", start as NSDate, end as NSDate)
        req.sortDescriptors = [NSSortDescriptor(keyPath: \SymptomLogEntity.date, ascending: false)]
        req.returnsObjectsAsFaults = false
        guard let entities = try? context.fetch(req) as? [SymptomLogEntity] else { return [] }
        return entities.compactMap { e -> SymptomEntry? in
            guard let json = e.payloadJSON, let d = json.data(using: .utf8) else { return nil }
            return try? decoder.decode(SymptomEntry.self, from: d)
        }
    }

    func symptomEntry(for date: Date) -> SymptomEntry? {
        let cal = Calendar.current
        let start = cal.startOfDay(for: date)
        let end = cal.date(byAdding: .day, value: 1, to: start) ?? start
        return symptomEntries(from: start, to: end).first
    }

    // MARK: - Alert history

    func saveAlert(_ record: AlertRecord) {
        let entity = AlertHistoryEntity(context: context)
        entity.id = record.id
        entity.date = record.date
        entity.kindRaw = record.kind.rawValue
        entity.title = record.title
        entity.message = record.message
        entity.wasRedRisk = record.wasRedRisk
        try? context.save()
    }

    func alertHistory(limit: Int = 100) -> [AlertRecord] {
        let req = AlertHistoryEntity.fetchRequest()
        req.sortDescriptors = [NSSortDescriptor(keyPath: \AlertHistoryEntity.date, ascending: false)]
        req.fetchLimit = limit
        req.returnsObjectsAsFaults = false
        guard let entities = try? context.fetch(req) as? [AlertHistoryEntity] else { return [] }
        return entities.map { e in
            AlertRecord(
                id: e.id ?? UUID(),
                date: e.date ?? Date(),
                kind: AlertKind(rawValue: e.kindRaw ?? "") ?? .other,
                title: e.title ?? "",
                message: e.message ?? "",
                wasRedRisk: e.wasRedRisk
            )
        }
    }
}
