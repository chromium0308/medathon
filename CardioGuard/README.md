# CardioGuard

A personalized cardiac monitoring app for heart failure patients and at-risk users. Uses Apple Watch + HealthKit data to compute a daily risk score and send actionable alerts.

## Requirements

- Xcode 15+
- iOS 16+
- Apple Watch (optional but recommended for live HR/HRV)

## Setup

1. Open `CardioGuard.xcodeproj` in Xcode (from the **CardioGuard** folder that contains the `.xcodeproj` and all source files).
2. Select the **CardioGuard** target → **Signing & Capabilities** → add your Team and ensure **HealthKit** and **Background Modes (Background fetch)** are enabled. The project includes `CardioGuard.entitlements` for HealthKit.
3. Build and run on a device or simulator. On simulator, HealthKit will prompt but data will be limited.

## Features (MVP)

- **Onboarding**: HF type (HFrEF, HFpEF, Right-sided, Left-sided, At Risk), medications, baseline vitals, HealthKit permission.
- **Home dashboard**: Today’s risk score (0–100, green/amber/red), live HR and HRV from HealthKit, 7-day weight and step charts, daily symptom check-in.
- **Trends**: 7/30/90 day charts for HR, HRV, respiratory rate, steps, weight, sleep.
- **Symptom log**: Daily check-in (shortness of breath, fatigue, swelling, dizziness, sleep quality) and history.
- **Medications**: List of selected meds and how they affect monitoring (e.g. beta-blockers, diuretics, Digoxin).
- **Alerts & history**: Log of past alerts (red risk, bradycardia/tachycardia, weight gain, irregular rhythm, declining activity).
- **Settings**: Update HF type, medications, baseline vitals; notification toggle; reset onboarding.

## HealthKit data

- Heart rate, HRV (SDNN), respiratory rate, step count, body mass, sleep analysis, irregular heart rhythm (iOS 16+).
- Data is polled every 15 minutes and stored in Core Data for trend and risk computation.

## Risk scoring

- Rule-based daily score (0–100) from baseline deviations, symptom scores, and HF-type–specific weights.
- **Green** (0–39): Stable. **Yellow** (40–69): Monitor. **Red** (70–100): Contact cardiologist; push notification sent.

## Design

- Clean medical UI with red/amber/green risk colors, SF Symbols, Dynamic Type and VoiceOver friendly, dark mode supported.

## Deferred to v2

- Clinician dashboard, cloud sync, lab result input (e.g. creatinine, potassium), ML-based risk model.
