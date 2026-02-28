import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Activity, Wind, Footprints, Moon, Scale, AlertTriangle, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, Pill, Plus } from "lucide-react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import {
  generateHeartRateData, generateHRVData, generateRespiratoryData,
  generateWeightData, generateActivityData, generateSleepData,
  mockRiskAlerts, type RiskAlert, type RiskLevel,
} from "@/lib/mockData";

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

const MetricCard = ({ icon: Icon, label, value, unit, trend }: { icon: any; label: string; value: string; unit: string; trend?: "up" | "down" | "stable" }) => (
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

const VitalChart = ({ data, label, color = "hsl(14, 100%, 55%)", unit }: { data: any[]; label: string; color?: string; unit: string }) => (
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

const PatientDashboard = () => {
  const [loggedSymptoms, setLoggedSymptoms] = useState<string[]>([]);
  const hrData = generateHeartRateData();
  const hrvData = generateHRVData();
  const rrData = generateRespiratoryData();
  const weightData = generateWeightData();
  const activityData = generateActivityData();
  const sleepData = generateSleepData();

  const toggleSymptom = (s: string) => {
    setLoggedSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const highestRisk = mockRiskAlerts.reduce((max, a) => (a.score > max.score ? a : max), mockRiskAlerts[0]);

  return (
    <div className="min-h-screen bg-background">
      <Header variant="patient" />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-foreground tracking-tight">Patient Dashboard</h1>
            <p className="text-sm text-muted-foreground">Last wearable sync: 5 minutes ago</p>
          </div>
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${riskColors[highestRisk.level].bg} ${riskColors[highestRisk.level].text} ${highestRisk.level === "red" ? "glow-red" : ""}`}>
            <RiskIcon level={highestRisk.level} />
            Overall Status: {riskColors[highestRisk.level].label} — <span className="text-lg font-extrabold">{highestRisk.score}%</span> Risk
          </div>
        </div>

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
              <Badge className="gap-1 border-0 bg-destructive/15 text-destructive"><AlertTriangle className="h-3 w-3" /> Tachycardia Flag: HR &gt; 100 bpm detected</Badge>
              <Badge className="gap-1 border-0 bg-warning/15 text-warning"><AlertCircle className="h-3 w-3" /> Irregular Rhythm: 3 episodes in 48h</Badge>
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
                <p className="mb-3 text-sm text-muted-foreground">Select any symptoms you're experiencing today:</p>
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
              {mockRiskAlerts.map((alert) => (
                <motion.div key={alert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Number(alert.id) * 0.1 }}>
                  <RiskAlertCard alert={alert} />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="meds">
            <div className="rounded-2xl glass-surface p-6">
              <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Active Medications</h3>
              <div className="space-y-3">
                {[
                  { name: "Digoxin", dose: "0.25mg", freq: "Once daily", status: "warning" as const },
                  { name: "Furosemide", dose: "40mg", freq: "Twice daily", status: "ok" as const },
                  { name: "Lisinopril", dose: "10mg", freq: "Once daily", status: "warning" as const },
                  { name: "Metoprolol", dose: "25mg", freq: "Twice daily", status: "ok" as const },
                ].map((med) => (
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
