"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Heart, Activity, Wind, Footprints, Moon, Scale, AlertTriangle, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, Pill, Plus, Watch, RefreshCw, Loader2 } from "lucide-react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import {
  generateHeartRateData, generateHRVData, generateRespiratoryData,
  generateWeightData, generateActivityData, generateSleepData,
  mockRiskAlerts, type RiskAlert, type RiskLevel,
} from "@/lib/mockData";
import type { MetricPayload } from "@/lib/syncStore";

interface AnalyzeResult {
  riskLevel: RiskLevel;
  riskScore: number;
  alerts: RiskAlert[];
  flags?: string[];
  medications?: { name: string; dose: string; freq: string; status: "ok" | "warning" }[];
  lastAnalyzedAt: string;
}

const SYMPTOMS = ["Dyspnea", "Fatigue", "Swelling", "Dizziness", "Nausea", "Palpitations"];

const riskColors: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  green: { bg: "risk-green", text: "text-success-foreground", label: "Stable" },
  yellow: { bg: "risk-yellow", text: "text-warning-foreground", label: "Monitor" },
  red: { bg: "risk-red", text: "text-destructive-foreground", label: "Alert" },
};

const RiskIcon = ({ level }: { level: RiskLevel }) => {
  if (level === "green") return <CheckCircle2 className="h-5 w-5" />;
  if (level === "yellow") return <AlertCircle className="h-5 w-5" />;
  return <AlertTriangle className="h-5 w-5" />;
};

const MetricCard = ({ icon: Icon, label, value, unit, trend }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; unit: string; trend?: "up" | "down" | "stable" }) => (
  <div className="rounded-2xl glass-surface p-4 transition-all hover:border-primary/20">
    <div className="mb-2 flex items-center justify-between">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      {trend && (
        <span className={`flex items-center text-xs font-medium ${trend === "up" ? "text-destructive" : trend === "down" ? "text-success" : "text-muted-foreground"}`}>
          {trend === "up" ? <TrendingUp className="mr-0.5 h-3 w-3" /> : trend === "down" ? <TrendingDown className="mr-0.5 h-3 w-3" /> : "—"}
        </span>
      )}
    </div>
    <p className="text-3xl font-extrabold text-foreground tracking-tight">{value}<span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span></p>
    <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
  </div>
);

const VitalChart = ({ data, label, color = "hsl(14, 100%, 55%)", unit }: { data: { date: string; value: number }[]; label: string; color?: string; unit: string }) => (
  <div className="rounded-2xl glass-surface p-4">
    <h3 className="mb-4 font-display text-sm font-semibold text-foreground">{label}</h3>
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.15} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(240, 5%, 50%)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10, fill: "hsl(240, 5%, 50%)" }} tickLine={false} axisLine={false} width={35} />
        <Tooltip
          contentStyle={{ borderRadius: "12px", border: "1px solid hsl(240, 4%, 18%)", fontSize: "12px", background: "hsl(240, 5%, 10%)", color: "hsl(0, 0%, 95%)" }}
          formatter={(v: number) => [`${v} ${unit}`, label]}
        />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#grad-${label})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const RiskAlertCard = ({ alert }: { alert: RiskAlert }) => {
  const style = riskColors[alert.level];
  const isRed = alert.level === "red";
  return (
    <div className={`overflow-hidden rounded-2xl glass-surface ${isRed ? "glow-red" : ""}`}>
      <div className={`flex items-center gap-3 ${style.bg} px-4 py-3 ${style.text}`}>
        <RiskIcon level={alert.level} />
        <div className="flex-1">
          <p className="text-sm font-bold">{alert.domain}</p>
          <p className="text-xs opacity-90">{style.label}</p>
        </div>
        <span className="text-2xl font-extrabold">{alert.score}%</span>
      </div>
      <div className="p-4">
        <p className="mb-2 font-display text-sm font-semibold text-foreground">{alert.title}</p>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{alert.explanation}</p>
        <div className="rounded-xl bg-secondary/50 p-3">
          <p className="text-xs font-medium text-foreground">Suggested Action:</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{alert.action}</p>
        </div>
      </div>
    </div>
  );
};

/** Build chart-ready series from CardioGuard sync metrics (metricType: heartRate, hrv, etc.) */
function metricsToChartData(metrics: MetricPayload[] | null | undefined, type: string): { date: string; value: number }[] {
  if (!metrics?.length) return [];
  const filtered = metrics
    .filter((m) => m.metricType === type)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return filtered.map((m) => ({
    date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: m.value,
  }));
}

const PatientDashboard = () => {
  const [loggedSymptoms, setLoggedSymptoms] = useState<string[]>([]);
  const [syncCode, setSyncCode] = useState("");
  const [syncData, setSyncData] = useState<{
    lastSyncedAt?: string;
    liveHR?: number;
    liveHRV?: number;
    riskScore?: number;
    riskLevel?: string;
    metrics?: MetricPayload[];
  } | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    age?: string; sex?: string; height?: string; weight?: string;
    restingHR?: string; activityLevel?: string; respiratoryRate?: string;
  } | null>(null);
  const [hfType, setHfType] = useState<string | null>(null);
  const [onboardingMedications, setOnboardingMedications] = useState<{ name: string; dose?: string; frequency?: string }[]>([]);
  const [labs, setLabs] = useState<Record<string, string> | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [randomDefaultScore, setRandomDefaultScore] = useState<number | null>(null);

  useEffect(() => {
    setRandomDefaultScore(Math.floor(Math.random() * 40));
  }, []);

  const loadSyncData = async (code: string) => {
    if (!code.trim()) return;
    setSyncLoading(true);
    setSyncError(null);
    try {
      const res = await fetch(`/api/sync?syncCode=${encodeURIComponent(code.trim())}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "No data found for this code");
      }
      const data = await res.json();
      setSyncData({
        lastSyncedAt: data.lastSyncedAt,
        liveHR: data.liveHR,
        liveHRV: data.liveHRV,
        riskScore: data.riskScore,
        riskLevel: data.riskLevel,
        metrics: data.metrics,
      });
      if (typeof window !== "undefined") window.localStorage.setItem("ventria.syncCode", code.trim());
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : "Failed to load");
      setSyncData(null);
    } finally {
      setSyncLoading(false);
    }
  };

  const getOrCreateUserId = (): string => {
    if (typeof window === "undefined") return "";
    let id = window.localStorage.getItem("ventria.userId");
    if (!id) {
      id = "u_" + Math.random().toString(36).slice(2, 12);
      window.localStorage.setItem("ventria.userId", id);
    }
    return id;
  };

  const runAnalyze = async (metrics: {
    heartRate?: number;
    hrv?: number;
    respiratoryRate?: number;
    steps?: number;
    sleepHours?: number;
    weightKg?: number;
  }) => {
    const uid = userId ?? getOrCreateUserId();
    if (!userId) setUserId(uid);
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: profile ?? undefined,
          hfType: hfType ?? undefined,
          medications: onboardingMedications.length ? onboardingMedications : undefined,
          labs: labs ?? undefined,
          metrics,
          symptoms: loggedSymptoms,
          syncCode: syncCode || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Analysis failed");
      }
      const result = await res.json();
      const analyzed: AnalyzeResult = {
        riskLevel: result.riskLevel ?? "yellow",
        riskScore: result.riskScore ?? 40,
        alerts: result.alerts ?? [],
        flags: result.flags,
        medications: result.medications,
        lastAnalyzedAt: result.lastAnalyzedAt ?? new Date().toISOString(),
      };
      setAnalysis(analyzed);
      await fetch("/api/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: uid,
          merge: true,
          data: {
            analysis: analyzed,
            metrics,
            symptoms: loggedSymptoms,
            syncCode: syncCode || null,
          },
        }),
      });
    } catch (e) {
      setAnalysisError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const loadFromFirebase = async (uid: string) => {
    try {
      const res = await fetch(`/api/firebase?userId=${encodeURIComponent(uid)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data?.profile) setProfile(data.profile);
      if (data?.hfType) setHfType(data.hfType);
      if (data?.medications?.length) setOnboardingMedications(data.medications);
      if (data?.labs) setLabs(data.labs);
      if (data?.analysis) {
        setAnalysis({
          riskLevel: data.analysis.riskLevel ?? "yellow",
          riskScore: data.analysis.riskScore ?? 40,
          alerts: data.analysis.alerts ?? [],
          flags: data.analysis.flags,
          medications: data.analysis.medications,
          lastAnalyzedAt: data.analysis.lastAnalyzedAt ?? "",
        });
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("ventria.syncCode") : null;
    if (saved) {
      setSyncCode(saved);
      loadSyncData(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const uid = getOrCreateUserId();
    setUserId(uid);
    loadFromFirebase(uid);
  }, []);

  useEffect(() => {
    if (!syncData) return;
    const heartRate = syncData.liveHR ?? (syncData.metrics?.filter((m) => m.metricType === "heartRate").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.value);
    const hrv = syncData.liveHRV ?? (syncData.metrics?.filter((m) => m.metricType === "hrv").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.value);
    const respiratoryRate = syncData.metrics?.filter((m) => m.metricType === "respiratoryRate").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.value;
    const steps = syncData.metrics?.filter((m) => m.metricType === "steps").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.value;
    const sleepHours = syncData.metrics?.filter((m) => m.metricType === "sleep").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.value;
    const weightKg = syncData.metrics?.filter((m) => m.metricType === "weight").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.value;
    if (heartRate != null || hrv != null || steps != null || weightKg != null) {
      runAnalyze({ heartRate, hrv, respiratoryRate, steps, sleepHours, weightKg });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run only when sync data first arrives
  }, [syncData?.lastSyncedAt]);

  // Auto-compute heart failure vulnerability when profile was loaded from onboarding but no analysis yet
  useEffect(() => {
    if (!profile || analysis !== null || analysisLoading) return;
    const heartRate = syncData?.liveHR ?? (hrData.length ? hrData[hrData.length - 1].value : undefined);
    const hrv = syncData?.liveHRV ?? (hrvData.length ? hrvData[hrvData.length - 1].value : undefined);
    const rr = rrData.length ? rrData[rrData.length - 1].value : undefined;
    const steps = activityData.length ? activityData[activityData.length - 1].value : undefined;
    const sleepHours = sleepData.length ? sleepData[sleepData.length - 1].value : undefined;
    const weightKg = weightData.length ? weightData[weightData.length - 1].value : undefined;
    runAnalyze({ heartRate, hrv, respiratoryRate: rr, steps, sleepHours, weightKg });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when profile loads
  }, [profile]);

  const hrData = useMemo(() => {
    const fromSync = metricsToChartData(syncData?.metrics, "heartRate");
    return fromSync.length ? fromSync : generateHeartRateData();
  }, [syncData?.metrics]);
  const hrvData = useMemo(() => {
    const fromSync = metricsToChartData(syncData?.metrics, "hrv");
    return fromSync.length ? fromSync : generateHRVData();
  }, [syncData?.metrics]);
  const rrData = useMemo(() => {
    const fromSync = metricsToChartData(syncData?.metrics, "respiratoryRate");
    return fromSync.length ? fromSync : generateRespiratoryData();
  }, [syncData?.metrics]);
  const weightData = useMemo(() => {
    const fromSync = metricsToChartData(syncData?.metrics, "weight");
    return fromSync.length ? fromSync : generateWeightData();
  }, [syncData?.metrics]);
  const activityData = useMemo(() => {
    const fromSync = metricsToChartData(syncData?.metrics, "steps");
    return fromSync.length ? fromSync : generateActivityData();
  }, [syncData?.metrics]);
  const sleepData = useMemo(() => {
    const fromSync = metricsToChartData(syncData?.metrics, "sleep");
    return fromSync.length ? fromSync : generateSleepData();
  }, [syncData?.metrics]);

  const toggleSymptom = (s: string) => {
    setLoggedSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const highestRisk = useMemo(() => {
    if (analysis) {
      return { level: analysis.riskLevel, score: analysis.riskScore };
    }
    const displayRiskLevel = syncData?.riskLevel?.toLowerCase() as RiskLevel | undefined;
    const displayRiskScore = syncData?.riskScore;
    if (displayRiskLevel && displayRiskScore != null && ["green", "yellow", "red"].includes(displayRiskLevel)) {
      return { level: displayRiskLevel, score: displayRiskScore };
    }
    if (randomDefaultScore !== null) {
      return { level: "green" as RiskLevel, score: randomDefaultScore };
    }
    return mockRiskAlerts.reduce((max, a) => (a.score > max.score ? a : max), mockRiskAlerts[0]);
  }, [analysis, syncData?.riskLevel, syncData?.riskScore, randomDefaultScore]);

  const currentMetrics = useMemo(() => ({
    heartRate: syncData?.liveHR ?? (hrData.length ? hrData[hrData.length - 1].value : undefined),
    hrv: syncData?.liveHRV ?? (hrvData.length ? hrvData[hrvData.length - 1].value : undefined),
    respiratoryRate: rrData.length ? rrData[rrData.length - 1].value : undefined,
    steps: activityData.length ? activityData[activityData.length - 1].value : undefined,
    sleepHours: sleepData.length ? sleepData[sleepData.length - 1].value : undefined,
    weightKg: weightData.length ? weightData[weightData.length - 1].value : undefined,
  }), [syncData?.liveHR, syncData?.liveHRV, hrData, hrvData, rrData, activityData, sleepData, weightData]);

  const handleComputeWithAI = () => {
    runAnalyze(currentMetrics);
  };

  const lastSyncLabel = syncData?.lastSyncedAt
    ? (() => {
        const d = new Date(syncData.lastSyncedAt);
        const mins = Math.floor((Date.now() - d.getTime()) / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
        const h = Math.floor(mins / 60);
        return `${h} hour${h !== 1 ? "s" : ""} ago`;
      })()
    : "No Apple Watch data yet";

  return (
    <div className="min-h-screen bg-background">
      <Header variant="patient" />

      <div className="container mx-auto px-4 py-6">
        {/* Apple Watch import */}
        <div className="mb-6 rounded-2xl glass-surface p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Watch className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">Import from Apple Watch</h2>
                <p className="text-sm text-muted-foreground">
                  Sync heart rate, HRV, steps, sleep &amp; more from your wearable. Enter your sync code below or set Ventria&apos;s URL in your Apple Watch app Settings.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                placeholder="Sync code"
                value={syncCode}
                onChange={(e) => setSyncCode(e.target.value)}
                className="max-w-[180px] bg-secondary/50 border-border/30"
              />
              <Button
                onClick={() => loadSyncData(syncCode)}
                disabled={syncLoading}
                className="gradient-accent border-0 text-primary-foreground"
              >
                {syncLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {syncLoading ? " Loading…" : " Load data"}
              </Button>
            </div>
          </div>
          {syncError && <p className="mt-2 text-sm text-destructive">{syncError}</p>}
          {syncData && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <Badge className="border-0 bg-success/15 text-success">Last sync: {lastSyncLabel}</Badge>
              {syncData.liveHR != null && <span className="text-muted-foreground">Live HR: <strong className="text-foreground">{syncData.liveHR} bpm</strong></span>}
              {syncData.liveHRV != null && <span className="text-muted-foreground">Live HRV: <strong className="text-foreground">{syncData.liveHRV} ms</strong></span>}
            </div>
          )}
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-foreground tracking-tight">Patient Dashboard</h1>
            <p className="text-sm text-muted-foreground">{syncData ? `Wearable sync: ${lastSyncLabel}` : "Last wearable sync: 5 minutes ago"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleComputeWithAI}
              disabled={analysisLoading}
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              {analysisLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {analysisLoading ? " Computing…" : "Compute with AI"}
            </Button>
            <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${riskColors[highestRisk.level].bg} ${riskColors[highestRisk.level].text} ${highestRisk.level === "red" ? "glow-red" : ""}`}>
              <RiskIcon level={highestRisk.level} />
              Heart failure vulnerability: {riskColors[highestRisk.level].label} — <span className="text-lg font-extrabold">{highestRisk.score}%</span>
            </div>
          </div>
        </div>
        {analysisError && <p className="mb-4 text-sm text-destructive">{analysisError}</p>}

        <Tabs defaultValue="vitals">
          <TabsList className="mb-6 w-full justify-start bg-secondary/50 border border-border/30">
            <TabsTrigger value="vitals">Wearable Data</TabsTrigger>
            <TabsTrigger value="manual">Manual Inputs</TabsTrigger>
            <TabsTrigger value="risks">AI Risk Engine</TabsTrigger>
            <TabsTrigger value="meds">Medications</TabsTrigger>
          </TabsList>

          <TabsContent value="vitals">
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <MetricCard icon={Heart} label="Resting Heart Rate" value={String(hrData[hrData.length - 1].value)} unit="bpm" trend="up" />
              <MetricCard icon={Activity} label="HRV" value={String(hrvData[hrvData.length - 1].value)} unit="ms" trend="down" />
              <MetricCard icon={Wind} label="Respiratory Rate" value={String(rrData[rrData.length - 1].value)} unit="br/m" trend="up" />
              <MetricCard icon={Footprints} label="Steps Today" value={String(activityData[activityData.length - 1].value)} unit="steps" trend="down" />
              <MetricCard icon={Moon} label="Sleep" value={String(sleepData[sleepData.length - 1].value)} unit="hrs" trend="stable" />
              <MetricCard icon={Scale} label="Weight" value={String(weightData[weightData.length - 1].value)} unit="kg" trend="up" />
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {analysis?.flags?.length ? analysis.flags.map((flag, i) => (
                <Badge key={i} className={`gap-1 border-0 ${flag.toLowerCase().includes("tachy") || flag.toLowerCase().includes("hr") ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"}`}>
                  {flag.toLowerCase().includes("tachy") || flag.toLowerCase().includes("hr") ? <AlertTriangle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  {flag}
                </Badge>
              )) : (
                <>
                  <Badge className="gap-1 border-0 bg-destructive/15 text-destructive"><AlertTriangle className="h-3 w-3" /> Tachycardia Flag: HR &gt; 100 bpm detected</Badge>
                  <Badge className="gap-1 border-0 bg-warning/15 text-warning"><AlertCircle className="h-3 w-3" /> Irregular Rhythm: 3 episodes in 48h</Badge>
                </>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <VitalChart data={hrData} label="Heart Rate Trend" unit="bpm" />
              <VitalChart data={hrvData} label="HRV Trend" color="hsl(25, 100%, 50%)" unit="ms" />
              <VitalChart data={rrData} label="Respiratory Rate" color="hsl(142, 70%, 45%)" unit="br/min" />
              <VitalChart data={activityData} label="Daily Activity" color="hsl(30, 100%, 50%)" unit="steps" />
              <VitalChart data={sleepData} label="Sleep Duration" color="hsl(260, 60%, 55%)" unit="hours" />
              <VitalChart data={weightData} label="Daily Weight" color="hsl(0, 100%, 59%)" unit="kg" />
            </div>
          </TabsContent>

          <TabsContent value="manual">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl glass-surface p-6">
                <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Log Daily Weight</h3>
                <div className="flex gap-3">
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Weight (kg)</label>
                    <input type="number" className="w-full rounded-xl border border-input bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. 83.2" />
                  </div>
                  <Button className="mt-6 gradient-accent border-0 text-primary-foreground">
                    <Plus className="mr-1 h-4 w-4" /> Log
                  </Button>
                </div>
                <div className="mt-4">
                  <VitalChart data={weightData} label="Weight History" color="hsl(0, 100%, 59%)" unit="kg" />
                </div>
              </div>

              <div className="rounded-2xl glass-surface p-6">
                <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Log Symptoms</h3>
                <p className="mb-3 text-sm text-muted-foreground">Select any symptoms you&apos;re experiencing today:</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {SYMPTOMS.map((s) => (
                    <button key={s} onClick={() => toggleSymptom(s)}
                      className={`rounded-xl border p-3 text-left text-sm font-medium transition-all ${loggedSymptoms.includes(s) ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
                    >
                      {loggedSymptoms.includes(s) ? <CheckCircle2 className="mb-1 h-4 w-4" /> : <Plus className="mb-1 h-4 w-4" />}
                      {s}
                    </button>
                  ))}
                </div>
                {loggedSymptoms.length > 0 && (
                  <div className="mt-4 rounded-xl bg-secondary/50 p-3">
                    <p className="text-xs font-medium text-foreground">Logged today: {loggedSymptoms.join(", ")}</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="risks">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-extrabold text-foreground tracking-tight">AI Risk Engine — 5 Domains</h2>
              <p className="text-sm text-muted-foreground">Real-time risk analysis with explainable AI. Updated continuously from wearable and manual data.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {(analysis?.alerts?.length ? analysis.alerts : mockRiskAlerts).map((alert, idx) => (
                <motion.div key={alert.id ?? idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                  <RiskAlertCard alert={alert} />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="meds">
            <div className="rounded-2xl glass-surface p-6">
              <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Active Medications</h3>
              <div className="space-y-3">
                {(analysis?.medications?.length ? analysis.medications : [
                  { name: "Digoxin", dose: "0.25mg", freq: "Once daily", status: "warning" as const },
                  { name: "Furosemide", dose: "40mg", freq: "Twice daily", status: "ok" as const },
                  { name: "Lisinopril", dose: "10mg", freq: "Once daily", status: "warning" as const },
                  { name: "Metoprolol", dose: "25mg", freq: "Twice daily", status: "ok" as const },
                ]).map((med) => (
                  <div key={med.name} className="flex items-center justify-between rounded-xl border border-border/30 p-4 transition-all hover:border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${med.status === "warning" ? "bg-warning/10" : "bg-success/10"}`}>
                        <Pill className={`h-4 w-4 ${med.status === "warning" ? "text-warning" : "text-success"}`} />
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold text-foreground">{med.name}</p>
                        <p className="text-xs text-muted-foreground">{med.dose} · {med.freq}</p>
                      </div>
                    </div>
                    {med.status === "warning" && (
                      <Badge className="border-0 bg-warning/15 text-warning">Review Needed</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDashboard;
