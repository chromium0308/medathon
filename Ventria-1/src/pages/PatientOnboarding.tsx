"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, User, Pill, FlaskConical, ArrowRight, ArrowLeft, Check, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";

const STEPS = [
  { icon: User, label: "Patient Profile" },
  { icon: Heart, label: "HF Customization" },
  { icon: Pill, label: "Medications" },
  { icon: FlaskConical, label: "Lab Results" },
];

const HF_TYPES = [
  { value: "hfref", label: "HFrEF (Reduced EF)", metrics: ["Heart Rate", "HRV", "Respiratory Rate", "Weight", "Activity", "Sleep", "Arrhythmia Detection"] },
  { value: "hfpef", label: "HFpEF (Preserved EF)", metrics: ["Activity Trends", "Respiratory Rate", "HRV", "Symptom Logging", "Sleep"] },
  { value: "right", label: "Right-Sided HF", metrics: ["Daily Weight", "Edema Logging", "Activity", "Heart Rate"] },
  { value: "left", label: "Left-Sided HF", metrics: ["Respiratory Rate", "Heart Rate", "Sleep Disturbances", "Dyspnea Logging"] },
  { value: "none", label: "No Diagnosis (Predictive Mode)", metrics: ["Heart Rate", "HRV", "Activity", "Sleep", "Weight", "Respiratory Rate"] },
];

const MEDICATIONS = ["Digoxin", "Furosemide", "Spironolactone", "Metoprolol", "Lisinopril", "Amiodarone", "Warfarin", "Apixaban"];

interface MedEntry {
  name: string;
  dose: string;
  frequency: string;
  startDate: string;
}

const PatientOnboarding = () => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ age: "", sex: "", height: "", weight: "", restingHR: "", activityLevel: "", respiratoryRate: "" });
  const [hfType, setHfType] = useState("");
  const [medications, setMedications] = useState<MedEntry[]>([]);
  const [labs, setLabs] = useState({ creatinine: "", potassium: "", sodium: "", inr: "", date: "" });
  const [customMed, setCustomMed] = useState("");

  const addMedication = (name: string) => {
    if (!medications.find((m) => m.name === name)) {
      setMedications([...medications, { name, dose: "", frequency: "Once daily", startDate: "" }]);
    }
  };

  const removeMedication = (name: string) => {
    setMedications(medications.filter((m) => m.name !== name));
  };

  const updateMedication = (index: number, field: keyof MedEntry, value: string) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const selectedHFType = HF_TYPES.find((h) => h.value === hfType);

  const getOrCreateUserId = (): string => {
    if (typeof window === "undefined") return "";
    let id = window.localStorage.getItem("ventria.userId");
    if (!id) {
      id = "u_" + Math.random().toString(36).slice(2, 12);
      window.localStorage.setItem("ventria.userId", id);
    }
    return id;
  };

  const saveToFirebase = async () => {
    const uid = getOrCreateUserId();
    try {
      await fetch("/api/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: uid,
          merge: true,
          data: {
            profile: {
              age: profile.age,
              sex: profile.sex,
              height: profile.height,
              weight: profile.weight,
              restingHR: profile.restingHR,
              activityLevel: profile.activityLevel,
              respiratoryRate: profile.respiratoryRate,
            },
            hfType,
            medications,
            labs,
          },
        }),
      });
    } catch {
      // ignore
    }
  };

  const goNext = () => {
    saveToFirebase();
    setStep(step + 1);
  };

  const launchDashboard = () => {
    saveToFirebase();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header variant="patient" />

      <div className="container mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mx-auto mb-10 max-w-2xl">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${i <= step ? "gradient-accent border-primary text-primary-foreground" : "border-border/50 text-muted-foreground"}`}>
                    {i < step ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${i <= step ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`mx-2 h-px flex-1 ${i < step ? "bg-primary" : "bg-border/50"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
            className="mx-auto max-w-2xl rounded-2xl glass-surface p-8"
          >
            {/* Step 1: Profile */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-foreground tracking-tight">Patient Profile Setup</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Enter your baseline health information for personalized monitoring.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Age</Label>
                    <Input type="number" placeholder="e.g. 65" value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} className="bg-secondary/50 border-border/30" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Sex</Label>
                    <Select value={profile.sex} onValueChange={(v) => setProfile({ ...profile, sex: v })}>
                      <SelectTrigger className="bg-secondary/50 border-border/30"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Height (cm)</Label>
                    <Input type="number" placeholder="e.g. 175" value={profile.height} onChange={(e) => setProfile({ ...profile, height: e.target.value })} className="bg-secondary/50 border-border/30" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Weight (kg)</Label>
                    <Input type="number" placeholder="e.g. 82" value={profile.weight} onChange={(e) => setProfile({ ...profile, weight: e.target.value })} className="bg-secondary/50 border-border/30" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Baseline Resting HR (bpm)</Label>
                    <Input type="number" placeholder="e.g. 72" value={profile.restingHR} onChange={(e) => setProfile({ ...profile, restingHR: e.target.value })} className="bg-secondary/50 border-border/30" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Baseline Activity Level</Label>
                    <Select value={profile.activityLevel} onValueChange={(v) => setProfile({ ...profile, activityLevel: v })}>
                      <SelectTrigger className="bg-secondary/50 border-border/30"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="light">Lightly Active</SelectItem>
                        <SelectItem value="moderate">Moderately Active</SelectItem>
                        <SelectItem value="active">Very Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-muted-foreground">Baseline Respiratory Rate (breaths/min) — Optional</Label>
                    <Input type="number" placeholder="e.g. 16" value={profile.respiratoryRate} onChange={(e) => setProfile({ ...profile, respiratoryRate: e.target.value })} className="bg-secondary/50 border-border/30" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: HF Type */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-foreground tracking-tight">Heart Failure Customization</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Select your diagnosis type to prioritize monitoring metrics.</p>
                </div>
                <div className="space-y-3">
                  {HF_TYPES.map((type) => (
                    <button key={type.value} onClick={() => setHfType(type.value)}
                      className={`w-full rounded-xl border p-4 text-left transition-all ${hfType === type.value ? "border-primary bg-primary/5 shadow-glow" : "border-border/30 hover:border-primary/30"}`}
                    >
                      <p className="font-display font-semibold text-foreground">{type.label}</p>
                      {hfType === type.value && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3">
                          <p className="mb-2 text-xs font-medium text-muted-foreground">Prioritized Metrics:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {type.metrics.map((m, i) => (
                              <span key={m} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                #{i + 1} {m}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Medications */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-foreground tracking-tight">Medication Input</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Add your current cardiac medications for safety monitoring.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {MEDICATIONS.map((med) => {
                    const isAdded = medications.some((m) => m.name === med);
                    return (
                      <button key={med} onClick={() => isAdded ? removeMedication(med) : addMedication(med)}
                        className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${isAdded ? "border-primary bg-primary/10 text-primary" : "border-border/30 text-muted-foreground hover:border-primary/30"}`}
                      >
                        {isAdded ? <Check className="mr-1 inline h-3 w-3" /> : <Plus className="mr-1 inline h-3 w-3" />}
                        {med}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <Input placeholder="Custom medication name" value={customMed} onChange={(e) => setCustomMed(e.target.value)} className="bg-secondary/50 border-border/30" />
                  <Button variant="outline" className="border-border/30" onClick={() => { if (customMed.trim()) { addMedication(customMed.trim()); setCustomMed(""); } }}>
                    <Plus className="mr-1 h-4 w-4" /> Add
                  </Button>
                </div>

                {medications.length > 0 && (
                  <div className="space-y-3">
                    {medications.map((med, i) => (
                      <div key={med.name} className="rounded-xl border border-border/30 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="font-display font-semibold text-foreground">{med.name}</span>
                          <button onClick={() => removeMedication(med.name)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Dose</Label>
                            <Input placeholder="e.g. 0.25mg" value={med.dose} onChange={(e) => updateMedication(i, "dose", e.target.value)} className="bg-secondary/50 border-border/30" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Frequency</Label>
                            <Select value={med.frequency} onValueChange={(v) => updateMedication(i, "frequency", v)}>
                              <SelectTrigger className="bg-secondary/50 border-border/30"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Once daily">Once daily</SelectItem>
                                <SelectItem value="Twice daily">Twice daily</SelectItem>
                                <SelectItem value="Three times daily">Three times daily</SelectItem>
                                <SelectItem value="As needed">As needed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Start Date</Label>
                            <Input type="date" value={med.startDate} onChange={(e) => updateMedication(i, "startDate", e.target.value)} className="bg-secondary/50 border-border/30" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Labs */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-foreground tracking-tight">Lab Results Input</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Enter your most recent lab values for renal and electrolyte monitoring.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Creatinine (mg/dL)</Label>
                    <Input type="number" step="0.1" placeholder="e.g. 1.2" value={labs.creatinine} onChange={(e) => setLabs({ ...labs, creatinine: e.target.value })} className="bg-secondary/50 border-border/30" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Potassium (mEq/L)</Label>
                    <Input type="number" step="0.1" placeholder="e.g. 4.2" value={labs.potassium} onChange={(e) => setLabs({ ...labs, potassium: e.target.value })} className="bg-secondary/50 border-border/30" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Sodium (mEq/L)</Label>
                    <Input type="number" step="1" placeholder="e.g. 138" value={labs.sodium} onChange={(e) => setLabs({ ...labs, sodium: e.target.value })} className="bg-secondary/50 border-border/30" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">INR (if on Warfarin)</Label>
                    <Input type="number" step="0.1" placeholder="e.g. 2.5" value={labs.inr} onChange={(e) => setLabs({ ...labs, inr: e.target.value })} className="bg-secondary/50 border-border/30" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-muted-foreground">Date of Lab</Label>
                    <Input type="date" value={labs.date} onChange={(e) => setLabs({ ...labs, date: e.target.value })} className="bg-secondary/50 border-border/30" />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0} className="border-border/30">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              {step < 3 ? (
                <Button onClick={goNext} className="gradient-accent border-0 text-primary-foreground">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={launchDashboard} className="gradient-accent border-0 text-primary-foreground">
                  Launch Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PatientOnboarding;
