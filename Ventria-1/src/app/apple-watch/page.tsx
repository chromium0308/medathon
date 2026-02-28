"use client";

import { motion } from "framer-motion";
import {
  Heart,
  Activity,
  Wind,
  Footprints,
  Moon,
  Scale,
  Watch,
  Shield,
  CheckCircle2,
  Smartphone,
  Zap,
  Droplets,
} from "lucide-react";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";

const DATA_TYPES = [
  {
    id: "heartRate",
    name: "Heart Rate",
    description: "Resting and active heart rate measured throughout the day.",
    unit: "bpm",
    icon: Heart,
    color: "hsl(0, 100%, 59%)",
    category: "Cardiovascular",
  },
  {
    id: "hrv",
    name: "Heart Rate Variability (HRV)",
    description: "Time between heartbeats. Lower HRV can indicate stress or decompensation risk.",
    unit: "ms",
    icon: Activity,
    color: "hsl(25, 100%, 50%)",
    category: "Cardiovascular",
  },
  {
    id: "respiratoryRate",
    name: "Respiratory Rate",
    description: "Breaths per minute from the watch sensor.",
    unit: "/min",
    icon: Wind,
    color: "hsl(142, 70%, 45%)",
    category: "Respiratory",
  },
  {
    id: "bloodOxygen",
    name: "Blood Oxygen (SpO₂)",
    description: "Blood oxygen saturation from the watch sensor. Can help monitor drug levels in the blood and respiratory wellness.",
    unit: "%",
    icon: Droplets,
    color: "hsl(200, 80%, 50%)",
    category: "Respiratory",
  },
  {
    id: "steps",
    name: "Steps & Activity",
    description: "Daily step count and general activity level.",
    unit: "count",
    icon: Footprints,
    color: "hsl(30, 100%, 50%)",
    category: "Activity",
  },
  {
    id: "sleep",
    name: "Sleep",
    description: "Sleep duration and quality from Apple Watch.",
    unit: "hours",
    icon: Moon,
    color: "hsl(260, 60%, 55%)",
    category: "Sleep",
  },
  {
    id: "weight",
    name: "Weight",
    description: "Body weight (from Health app or manual entry). Important for heart failure monitoring.",
    unit: "kg",
    icon: Scale,
    color: "hsl(0, 100%, 59%)",
    category: "Body",
  },
  {
    id: "irregularRhythm",
    name: "Irregular Rhythm",
    description: "Episodes of irregular heart rhythm detected by the watch.",
    unit: "events",
    icon: Zap,
    color: "hsl(40, 95%, 55%)",
    category: "Cardiovascular",
  },
];

const COMPATIBILITY = [
  { label: "Apple Watch", versions: "Series 4 or later (with ECG where noted)" },
  { label: "WatchOS", versions: "8.0 or later" },
  { label: "iPhone", versions: "iOS 15 or later" },
  { label: "HealthKit", versions: "Required for sync" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};

export default function AppleWatchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header variant="landing" />

      <main className="container mx-auto px-4 py-10 lg:py-16">
        {/* Hero */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-6">
            <Watch className="h-4 w-4" />
            Apple compatibility
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-4">
            Ventria &amp; Apple Watch
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Use your Apple Watch and the Health app to stream heart and activity data into Ventria for continuous cardiac monitoring and AI-powered risk insights.
          </p>
          <div className="mt-8 w-full rounded-2xl glass-surface border border-border/30 p-6 sm:p-8 text-left">
            <h3 className="font-display text-base font-semibold text-foreground mb-3">Sync with Apple Health</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              Ventria syncs data with Apple Health (HealthKit). Your watch writes heart rate, HRV, steps, sleep, and other metrics into the Health app, and Ventria uses that same data—with your permission—so you get one continuous record across devices.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By using the logs of past data from Apple Health, Ventria can detect minimal changes over time—small shifts in resting heart rate, HRV, or weight that might signal early risk—so you and your care team can act before larger changes occur.
            </p>
          </div>
        </motion.section>

        {/* Compatibility */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="mb-16"
        >
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-primary" />
            Compatibility
          </h2>
          <div className="rounded-2xl glass-surface p-6">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {COMPATIBILITY.map((item, i) => (
                <li key={item.label} className="flex items-center justify-between rounded-xl border border-border/30 bg-secondary/30 px-4 py-3">
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.versions}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* Data collected */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Data collected from your Apple Watch
          </h2>
          <p className="text-muted-foreground mb-8">
            Ventria uses the following data types from HealthKit and your watch. All data is encrypted and used only for your care.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {DATA_TYPES.map((item, i) => (
              <motion.div
                key={item.id}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="rounded-2xl glass-surface overflow-hidden border border-border/30 hover:border-primary/20 transition-colors"
              >
                <div className="flex gap-4 p-5">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <item.icon className="h-6 w-6" style={{ color: item.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-semibold text-foreground">
                        {item.name}
                      </h3>
                      <Badge variant="secondary" className="text-xs font-normal">
                        {item.category}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Unit: <span className="font-medium text-foreground">{item.unit}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Privacy & security */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="rounded-2xl glass-surface border border-border/30 p-6 lg:p-8"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Privacy &amp; security
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Data stays in your control. Ventria receives only what you sync from your watch app. We do not access your Health app directly; sync is initiated by you. All data is encrypted in transit and at rest (HIPAA-compliant).
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-sm font-medium text-success">
              <CheckCircle2 className="h-4 w-4" />
              HIPAA compliant
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
