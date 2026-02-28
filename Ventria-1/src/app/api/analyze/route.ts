import { NextRequest, NextResponse } from "next/server";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export interface AnalyzeInput {
  profile?: {
    age?: string | number;
    sex?: string;
    height?: string | number;
    weight?: string | number;
    restingHR?: string | number;
    activityLevel?: string;
    respiratoryRate?: string | number;
  };
  hfType?: string;
  medications?: { name: string; dose?: string; frequency?: string; startDate?: string }[];
  labs?: { creatinine?: string; potassium?: string; sodium?: string; inr?: string; date?: string };
  metrics?: {
    heartRate?: number;
    hrv?: number;
    respiratoryRate?: number;
    steps?: number;
    sleepHours?: number;
    weightKg?: number;
  };
  symptoms?: string[];
  syncCode?: string;
}

export interface RiskAlertOutput {
  id: string;
  domain: string;
  level: "green" | "yellow" | "red";
  score: number;
  title: string;
  explanation: string;
  action: string;
}

export interface AnalyzeOutput {
  riskLevel: "green" | "yellow" | "red";
  riskScore: number;
  alerts: RiskAlertOutput[];
  flags?: string[];
  medications?: { name: string; dose: string; freq: string; status: "ok" | "warning" }[];
  lastAnalyzedAt: string;
}

function buildPrompt(input: AnalyzeInput): string {
  const p = input.profile ?? {};
  const m = input.metrics ?? {};
  const symptoms = input.symptoms?.length ? input.symptoms.join(", ") : "None reported";
  const medsStr = input.medications?.length
    ? input.medications.map((x) => `${x.name}${x.dose ? " " + x.dose : ""}${x.frequency ? " " + x.frequency : ""}`).join("; ")
    : "None listed";
  const labsStr = input.labs
    ? `Creatinine: ${input.labs.creatinine ?? "—"}, Potassium: ${input.labs.potassium ?? "—"}, Sodium: ${input.labs.sodium ?? "—"}, INR: ${input.labs.inr ?? "—"}`
    : "None provided";

  return `You are a cardiac monitoring assistant. Given the following patient inputs from their profile and wearable/dashboard, compute HEART FAILURE VULNERABILITY and clinical insights.

PATIENT PROFILE (from onboarding):
- Age: ${p.age ?? "not provided"}
- Sex: ${p.sex ?? "not provided"}
- Height (cm): ${p.height ?? "not provided"}
- Weight (kg): ${p.weight ?? "not provided"}
- Baseline resting HR (bpm): ${p.restingHR ?? "not provided"}
- Activity level: ${p.activityLevel ?? "not provided"}
- Baseline respiratory rate: ${p.respiratoryRate ?? "not provided"}
- Heart failure type: ${input.hfType ?? "not specified"}
- Medications: ${medsStr}
- Labs: ${labsStr}

CURRENT WEARABLE / DASHBOARD METRICS:
- Heart rate (bpm): ${m.heartRate ?? "not provided"}
- HRV (ms): ${m.hrv ?? "not provided"}
- Respiratory rate (/min): ${m.respiratoryRate ?? "not provided"}
- Steps today: ${m.steps ?? "not provided"}
- Sleep (hours): ${m.sleepHours ?? "not provided"}
- Weight (kg): ${m.weightKg ?? "not provided"}
- Symptoms: ${symptoms}

Compute the percentage (0–100) that this person is VULNERABLE TO HEART FAILURE (worsening, decompensation, or incident HF) based on profile + metrics. Use riskScore for this percentage. Return ONLY valid JSON, no markdown.

{
  "riskLevel": "green" | "yellow" | "red",
  "riskScore": number 0-100 (heart failure vulnerability percentage),
  "alerts": [
    { "id": "1", "domain": "e.g. HF Decompensation", "level": "green"|"yellow"|"red", "score": number, "title": "short title", "explanation": "one sentence", "action": "suggested action" }
  ],
  "flags": ["e.g. Tachycardia", "Irregular rhythm"] or [],
  "medications": [ { "name": "e.g. Furosemide", "dose": "40mg", "freq": "Twice daily", "status": "ok"|"warning" } ]
}

Generate 3-5 alerts. Use or infer medications from profile; add plausible ones if missing. Keep text brief.`;
}

export async function POST(request: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  let body: AnalyzeInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = buildPrompt(body);

  try {
    const res = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini API error:", res.status, err);
      return NextResponse.json(
        { error: "Analysis failed", details: err.slice(0, 200) },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    if (!text) {
      return NextResponse.json({ error: "Empty response from Gemini" }, { status: 502 });
    }

    let parsed: Omit<AnalyzeOutput, "lastAnalyzedAt">;
    try {
      parsed = JSON.parse(text.replace(/^```json\s*|\s*```$/g, ""));
    } catch {
      return NextResponse.json({ error: "Invalid JSON from Gemini", raw: text.slice(0, 300) }, { status: 502 });
    }

    const output: AnalyzeOutput = {
      riskLevel: parsed.riskLevel ?? "yellow",
      riskScore: typeof parsed.riskScore === "number" ? parsed.riskScore : 40,
      alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
      flags: Array.isArray(parsed.flags) ? parsed.flags : [],
      medications: Array.isArray(parsed.medications) ? parsed.medications : undefined,
      lastAnalyzedAt: new Date().toISOString(),
    };

    return NextResponse.json(output);
  } catch (e) {
    console.error("Analyze error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
