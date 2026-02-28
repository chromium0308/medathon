import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, AlertTriangle, CheckCircle2, AlertCircle, Search, Users, FileDown, MessageSquare, TrendingUp, Activity, Pill } from "lucide-react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { mockPatients, mockRiskAlerts, generateHeartRateData, generateWeightData, type MockPatient, type RiskLevel } from "@/lib/mockData";

const riskColors: Record<RiskLevel, { bg: string; text: string; dot: string; label: string }> = {
  green: { bg: "bg-success/10", text: "text-success", dot: "bg-success", label: "Stable" },
  yellow: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning", label: "Monitor" },
  red: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive", label: "Alert" },
};

const RiskDot = ({ level }: { level: RiskLevel }) => (
  <span className={`inline-block h-2.5 w-2.5 rounded-full ${riskColors[level].dot}`} />
);

const ClinicianDashboard = () => {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<MockPatient | null>(null);
  const [messageText, setMessageText] = useState("");

  const filteredPatients = mockPatients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.hfType.toLowerCase().includes(search.toLowerCase())
  );

  const highRiskCount = mockPatients.filter((p) => p.riskLevel === "red").length;
  const monitorCount = mockPatients.filter((p) => p.riskLevel === "yellow").length;

  return (
    <div className="min-h-screen bg-background">
      <Header variant="clinician" />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-foreground tracking-tight">Clinician Dashboard</h1>
            <p className="text-sm text-muted-foreground">{mockPatients.length} patients · {highRiskCount} high-risk · {monitorCount} monitoring</p>
          </div>
          <Button variant="outline" className="gap-2 border-border/30">
            <FileDown className="h-4 w-4" /> Export Summary
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl glass-surface p-4">
            <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /> Total Patients</div>
            <p className="mt-2 text-4xl font-extrabold text-foreground">{mockPatients.length}</p>
          </div>
          <div className="rounded-2xl glass-surface p-4">
            <div className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-4 w-4" /> High Risk</div>
            <p className="mt-2 text-4xl font-extrabold text-gradient-accent">{highRiskCount}</p>
          </div>
          <div className="rounded-2xl glass-surface p-4">
            <div className="flex items-center gap-2 text-warning"><AlertCircle className="h-4 w-4" /> Monitoring</div>
            <p className="mt-2 text-4xl font-extrabold text-foreground">{monitorCount}</p>
          </div>
          <div className="rounded-2xl glass-surface p-4">
            <div className="flex items-center gap-2 text-success"><CheckCircle2 className="h-4 w-4" /> Stable</div>
            <p className="mt-2 text-4xl font-extrabold text-foreground">{mockPatients.filter((p) => p.riskLevel === "green").length}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Patient List */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl glass-surface overflow-hidden">
              <div className="border-b border-border/30 p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search patients..." className="pl-9 bg-secondary/50 border-border/30" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <button key={patient.id} onClick={() => setSelectedPatient(patient)}
                    className={`w-full border-b border-border/20 p-4 text-left transition-all hover:bg-secondary/30 ${selectedPatient?.id === patient.id ? "bg-secondary/50" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <RiskDot level={patient.riskLevel} />
                        <div>
                          <p className="font-display text-sm font-semibold text-foreground">{patient.name}</p>
                          <p className="text-xs text-muted-foreground">{patient.age}y · {patient.hfType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${riskColors[patient.riskLevel].bg} ${riskColors[patient.riskLevel].text} border-0`}>
                          {patient.riskScore}%
                        </Badge>
                        {patient.alerts > 0 && (
                          <p className="mt-1 text-xs text-destructive">{patient.alerts} alert{patient.alerts > 1 ? "s" : ""}</p>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Synced: {patient.lastSync}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Patient Detail */}
          <div className="lg:col-span-2">
            {selectedPatient ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl glass-surface p-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${riskColors[selectedPatient.riskLevel].bg}`}>
                      <Heart className={`h-6 w-6 ${riskColors[selectedPatient.riskLevel].text}`} />
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-bold text-foreground">{selectedPatient.name}</h2>
                      <p className="text-sm text-muted-foreground">{selectedPatient.age} years · {selectedPatient.hfType} · Last sync: {selectedPatient.lastSync}</p>
                    </div>
                  </div>
                  <span className={`text-3xl font-extrabold ${riskColors[selectedPatient.riskLevel].text}`}>
                    {selectedPatient.riskScore}%
                  </span>
                </div>

                <Tabs defaultValue="overview">
                  <TabsList className="bg-secondary/50 border border-border/30">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="vitals">Vitals</TabsTrigger>
                    <TabsTrigger value="meds">Medications</TabsTrigger>
                    <TabsTrigger value="message">Message</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {mockRiskAlerts.filter((a) => a.level !== "green").map((alert) => (
                        <div key={alert.id} className={`rounded-2xl glass-surface p-4 ${alert.level === "red" ? "glow-red" : ""}`}>
                          <div className="mb-2 flex items-center gap-2">
                            <span className={`inline-block h-2 w-2 rounded-full ${riskColors[alert.level].dot}`} />
                            <span className="text-sm font-semibold text-foreground">{alert.domain}</span>
                            <span className={`ml-auto text-lg font-extrabold ${riskColors[alert.level].text}`}>{alert.score}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{alert.explanation}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl glass-surface p-4">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground"><TrendingUp className="h-4 w-4 text-primary" /> Heart Rate (30d)</h3>
                        <ResponsiveContainer width="100%" height={120}>
                          <AreaChart data={generateHeartRateData()}>
                            <defs>
                              <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(14, 100%, 55%)" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="hsl(14, 100%, 55%)" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="value" stroke="hsl(14, 100%, 55%)" strokeWidth={2} fill="url(#hrGrad)" dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="rounded-2xl glass-surface p-4">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground"><Activity className="h-4 w-4 text-primary" /> Weight (30d)</h3>
                        <ResponsiveContainer width="100%" height={120}>
                          <AreaChart data={generateWeightData()}>
                            <defs>
                              <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(0, 100%, 59%)" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="hsl(0, 100%, 59%)" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="value" stroke="hsl(0, 100%, 59%)" strokeWidth={2} fill="url(#wGrad)" dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="vitals">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        { label: "Heart Rate", data: generateHeartRateData(), color: "hsl(14, 100%, 55%)" },
                        { label: "Weight", data: generateWeightData(), color: "hsl(0, 100%, 59%)" },
                      ].map((chart) => (
                        <div key={chart.label} className="rounded-2xl glass-surface p-4">
                          <h3 className="mb-3 text-sm font-semibold text-foreground">{chart.label} Trend</h3>
                          <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={chart.data}>
                              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(240, 5%, 50%)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                              <YAxis tick={{ fontSize: 10, fill: "hsl(240, 5%, 50%)" }} tickLine={false} axisLine={false} width={35} />
                              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(240, 4%, 18%)", fontSize: "12px", background: "hsl(240, 5%, 10%)", color: "hsl(0, 0%, 95%)" }} />
                              <Area type="monotone" dataKey="value" stroke={chart.color} strokeWidth={2} fill={chart.color} fillOpacity={0.1} dot={false} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="meds">
                    <div className="rounded-2xl glass-surface p-4">
                      <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-foreground"><Pill className="h-4 w-4 text-primary" /> Current Medications</h3>
                      <div className="space-y-2">
                        {selectedPatient.medications.map((med) => (
                          <div key={med} className="flex items-center justify-between rounded-xl border border-border/30 p-3 transition-all hover:border-primary/20">
                            <span className="text-sm font-medium text-foreground">{med}</span>
                            <span className="text-xs text-muted-foreground">Active</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="message">
                    <div className="rounded-2xl glass-surface p-4">
                      <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-foreground"><MessageSquare className="h-4 w-4 text-primary" /> Secure Message</h3>
                      <div className="mb-4 space-y-3 rounded-xl bg-secondary/30 p-4">
                        <div className="rounded-xl glass-surface p-3">
                          <p className="text-xs text-muted-foreground">System — Today</p>
                          <p className="mt-1 text-sm text-foreground">Patient {selectedPatient.name} flagged for elevated HF decompensation risk (score: {selectedPatient.riskScore}%).</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Input placeholder="Type a secure message..." value={messageText} onChange={(e) => setMessageText(e.target.value)} className="bg-secondary/50 border-border/30" />
                        <Button className="gradient-accent border-0 text-primary-foreground">Send</Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            ) : (
              <div className="flex h-96 items-center justify-center rounded-2xl glass-surface">
                <div className="text-center">
                  <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground/20" />
                  <p className="font-display text-lg font-semibold text-muted-foreground">Select a patient</p>
                  <p className="text-sm text-muted-foreground">Click a patient from the list to view their details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicianDashboard;
