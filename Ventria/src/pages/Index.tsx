import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Activity, Brain, Shield, Watch, Smartphone, Cloud, Monitor, ArrowRight, Star, Pill, FlaskConical, AlertTriangle, Stethoscope, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header variant="landing" />

      {/* HIPAA Banner */}
      <div className="gradient-accent py-2 text-center">
        <p className="text-sm font-medium text-primary-foreground">
          <Shield className="mr-1 inline h-3.5 w-3.5" />
          HIPAA-Compliant Platform — All data encrypted in transit and at rest
        </p>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="container relative mx-auto px-4 py-24 lg:py-36">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div initial="hidden" animate="visible" className="space-y-8">
              <motion.div variants={fadeUp} custom={0}>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
                  <Heart className="h-3 w-3" /> AI-Powered Cardiac Monitoring
                </span>
              </motion.div>
              <motion.h1 variants={fadeUp} custom={1} className="font-display text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Predictive Heart Failure &{" "}
                <span className="text-gradient-accent">
                  Cardiac Medication
                </span>{" "}
                Monitoring
              </motion.h1>
              <motion.p variants={fadeUp} custom={2} className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
                Continuous wearable tracking + AI-driven risk detection. Prevent decompensation, monitor medication safety, and protect kidney function — all in real time.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap justify-center gap-4">
                <Button size="lg" asChild className="gradient-accent border-0 text-primary-foreground shadow-glow hover:opacity-90 transition-all text-base px-8">
                  <Link to="/onboarding">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-border/50 text-foreground hover:bg-secondary text-base px-8">
                  <Link to="/clinician">Clinician Login</Link>
                </Button>
              </motion.div>
              <motion.div variants={fadeUp} custom={4} className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-success" /> HIPAA Compliant</span>
                <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-primary" /> Real-time Alerts</span>
                <span className="flex items-center gap-1.5"><Brain className="h-4 w-4 text-primary" /> AI-Powered</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16 text-center">
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl font-bold text-foreground sm:text-5xl">
              How CardioGuard Works
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              From wearable sensor to clinician dashboard — a seamless AI-powered pipeline for cardiac safety.
            </motion.p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              { icon: Watch, title: "Wearable Sync", desc: "Continuous heart rate, HRV, SpO2, and activity tracking via Bluetooth." },
              { icon: Smartphone, title: "Mobile App", desc: "Patient inputs symptoms, weight, and medication adherence daily." },
              { icon: Cloud, title: "Cloud AI Engine", desc: "5-domain risk analysis: HF decompensation, toxicity, renal, electrolytes, arrhythmia." },
              { icon: Monitor, title: "Dashboards", desc: "Patient and clinician dashboards with tiered alerts and explainable AI." },
            ].map((item, i) => (
              <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="group relative rounded-2xl glass-surface p-6 transition-all hover:shadow-elevated hover:border-primary/20"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-accent">
                  <item.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                {i < 3 && (
                  <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 md:block">
                    <ArrowRight className="h-5 w-5 text-primary/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16 text-center">
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl font-bold text-foreground sm:text-5xl">
              Comprehensive Cardiac Intelligence
            </motion.h2>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Heart, title: "Personalized HF Monitoring", desc: "Custom metric prioritization based on HFrEF, HFpEF, right-sided or left-sided heart failure type." },
              { icon: Pill, title: "Medication Safety Engine", desc: "Real-time toxicity detection for digoxin, amiodarone, warfarin, and 10+ cardiac medications." },
              { icon: FlaskConical, title: "Kidney-Adjusted Dosing", desc: "Creatinine trend monitoring with automatic alerts for ACE inhibitor and diuretic dose adjustment." },
              { icon: AlertTriangle, title: "Decompensation Prediction", desc: "AI scoring using weight, HR, HRV, activity, and symptom data to predict 7-day worsening risk." },
              { icon: Activity, title: "Arrhythmia Detection", desc: "Continuous rhythm monitoring with bradycardia, tachycardia, and irregular rhythm flagging." },
              { icon: Stethoscope, title: "Clinician Dashboard", desc: "Population health view with risk stratification, trend analysis, and secure patient messaging." },
            ].map((item, i) => (
              <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="rounded-2xl glass-surface p-6 transition-all hover:border-primary/20"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-display font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* System Architecture */}
      <section id="architecture" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16 text-center">
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl font-bold text-foreground sm:text-5xl">
              System Architecture
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="mx-auto max-w-3xl"
          >
            <div className="flex flex-col items-center gap-3">
              {[
                { icon: Watch, label: "Wearable Device", sub: "HR, HRV, SpO2, Activity, Sleep" },
                { icon: Smartphone, label: "Mobile / Web App", sub: "Symptoms, Weight, Medication, Labs" },
                { icon: Brain, label: "Cloud AI Risk Engine", sub: "5-Domain Analysis • Explainable AI" },
              ].map((item, i) => (
                <div key={item.label} className="w-full max-w-md">
                  <div className="flex items-center gap-4 rounded-2xl glass-surface p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-accent">
                      <item.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.sub}</p>
                    </div>
                  </div>
                  {i < 2 && (
                    <div className="flex justify-center py-1">
                      <div className="h-6 w-px bg-primary/30" />
                    </div>
                  )}
                </div>
              ))}
              <div className="flex justify-center py-1">
                <div className="h-6 w-px bg-primary/30" />
              </div>
              <div className="grid w-full max-w-md grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-2xl glass-surface p-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Patient Dashboard</p>
                    <p className="text-xs text-muted-foreground">Alerts & Self-tracking</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl glass-surface p-4">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Clinician Dashboard</p>
                    <p className="text-xs text-muted-foreground">Population Health</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16 text-center">
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl font-bold text-foreground sm:text-5xl">
              Trusted by Clinicians & Patients
            </motion.h2>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "Dr. Sarah Mitchell", role: "Cardiologist, Mayo Clinic", quote: "CardioGuard's AI risk engine caught a decompensation event 48 hours before clinical symptoms appeared. This is the future of heart failure management." },
              { name: "James W.", role: "HFrEF Patient", quote: "I feel safer knowing my vitals are continuously monitored. The medication safety alerts have been life-saving — literally." },
              { name: "Dr. Raj Patel", role: "Heart Failure Specialist", quote: "The kidney-adjusted dosing alerts alone have prevented several adverse events in my practice. Remarkable technology." },
            ].map((t, i) => (
              <motion.div key={t.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="rounded-2xl glass-surface p-6"
              >
                <div className="mb-3 flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">"{t.quote}"</p>
                <div>
                  <p className="font-display text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="mx-auto max-w-3xl rounded-3xl gradient-accent p-12 text-center shadow-glow"
          >
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl font-bold text-primary-foreground sm:text-4xl">
              Start Protecting Your Heart Today
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Join thousands of patients and clinicians using AI-powered cardiac monitoring to prevent hospital readmissions.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild className="bg-background text-foreground hover:bg-secondary border-0">
                <Link to="/onboarding">Patient Sign Up</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/clinician">Clinician Access</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            <span className="font-display text-sm font-semibold text-foreground">CardioGuard</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 CardioGuard. HIPAA-Compliant. All rights reserved.</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-success" /> Encrypted & Secure
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
