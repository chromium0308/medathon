type ChartPoint = { date: string; value: number; baseline?: number };

/** Deterministic 0–1 value from seed so server and client render the same (avoids hydration mismatch). */
function seeded(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDateKey(d: Date): string {
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/** Fixed base date so mock data is identical on server and client (avoids hydration mismatch). */
const MOCK_BASE_DATE = new Date("2025-02-01T12:00:00.000Z");

export const generateHeartRateData = (): ChartPoint[] => {
  const data: ChartPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(MOCK_BASE_DATE);
    d.setUTCDate(d.getUTCDate() - i);
    data.push({
      date: formatDateKey(d),
      value: 68 + Math.floor(seeded(i) * 20) + (i < 5 ? 10 : 0),
      baseline: 72,
    });
  }
  return data;
};

export const generateHRVData = (): ChartPoint[] => {
  const data: ChartPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(MOCK_BASE_DATE);
    d.setUTCDate(d.getUTCDate() - i);
    data.push({
      date: formatDateKey(d),
      value: 42 + Math.floor(seeded(i + 100) * 25) - (i < 5 ? 8 : 0),
    });
  }
  return data;
};

export const generateRespiratoryData = (): ChartPoint[] => {
  const data: ChartPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(MOCK_BASE_DATE);
    d.setUTCDate(d.getUTCDate() - i);
    data.push({
      date: formatDateKey(d),
      value: 14 + Math.floor(seeded(i + 200) * 6) + (i < 3 ? 3 : 0),
    });
  }
  return data;
};

export const generateWeightData = (): ChartPoint[] => {
  const data: ChartPoint[] = [];
  let weight = 82;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(MOCK_BASE_DATE);
    d.setUTCDate(d.getUTCDate() - i);
    weight += (seeded(i + 300) - 0.45) * 0.5;
    data.push({
      date: formatDateKey(d),
      value: parseFloat(weight.toFixed(1)),
    });
  }
  return data;
};

export const generateActivityData = (): ChartPoint[] => {
  const data: ChartPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(MOCK_BASE_DATE);
    d.setUTCDate(d.getUTCDate() - i);
    data.push({
      date: formatDateKey(d),
      value: 3000 + Math.floor(seeded(i + 400) * 6000) - (i < 5 ? 2000 : 0),
    });
  }
  return data;
};

export const generateSleepData = (): ChartPoint[] => {
  const data: ChartPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(MOCK_BASE_DATE);
    d.setUTCDate(d.getUTCDate() - i);
    data.push({
      date: formatDateKey(d),
      value: parseFloat((5 + seeded(i + 500) * 3.5).toFixed(1)),
    });
  }
  return data;
};

export type RiskLevel = 'green' | 'yellow' | 'red';

export interface RiskAlert {
  id: string;
  domain: string;
  level: RiskLevel;
  score: number;
  title: string;
  explanation: string;
  action: string;
}

export const mockRiskAlerts: RiskAlert[] = [
  {
    id: '1',
    domain: 'HF Decompensation',
    level: 'red',
    score: 67,
    title: '7-Day Worsening Risk Score: 67%',
    explanation: 'Risk increased due to rising weight (+1.8kg in 3 days), elevated resting HR (15% above baseline), and reduced daily activity (−32%).',
    action: 'Contact your provider within 24 hours. Monitor weight daily and restrict fluid intake.',
  },
  {
    id: '2',
    domain: 'Medication Toxicity',
    level: 'yellow',
    score: 45,
    title: 'Possible Digoxin Toxicity Risk',
    explanation: 'Rising creatinine (1.6 mg/dL), resting HR trending below 55 bpm, and reported nausea symptoms.',
    action: 'Medication review recommended. Do not skip doses but contact provider.',
  },
  {
    id: '3',
    domain: 'Kidney Function',
    level: 'yellow',
    score: 52,
    title: 'Renal Function Declining',
    explanation: 'Creatinine trend increasing from 1.2 to 1.6 mg/dL over 2 weeks while on ACE inhibitor.',
    action: 'Dose review recommended. Lab recheck in 3 days.',
  },
  {
    id: '4',
    domain: 'Electrolyte Imbalance',
    level: 'green',
    score: 18,
    title: 'Electrolytes Within Range',
    explanation: 'Potassium at 4.2 mEq/L. Sodium at 138 mEq/L. All values within normal limits.',
    action: 'Continue current regimen. Next lab check in 1 week.',
  },
  {
    id: '5',
    domain: 'Arrhythmia',
    level: 'yellow',
    score: 38,
    title: 'Irregular Rhythm Episodes Detected',
    explanation: '3 episodes of irregular rhythm detected in past 48 hours. Heart rate dropped below 50 bpm twice.',
    action: 'Monitor closely. Seek medical advice if symptoms occur.',
  },
];

export interface MockPatient {
  id: string;
  name: string;
  age: number;
  hfType: string;
  riskLevel: RiskLevel;
  riskScore: number;
  medications: string[];
  lastSync: string;
  alerts: number;
}

export const mockPatients: MockPatient[] = [
  { id: '1', name: 'Eleanor Vance', age: 72, hfType: 'HFrEF', riskLevel: 'red', riskScore: 68, medications: ['Digoxin', 'Furosemide', 'Lisinopril'], lastSync: '5 min ago', alerts: 3 },
  { id: '2', name: 'Robert Chen', age: 65, hfType: 'HFpEF', riskLevel: 'yellow', riskScore: 45, medications: ['Metoprolol', 'Spironolactone'], lastSync: '12 min ago', alerts: 1 },
  { id: '3', name: 'Maria Santos', age: 58, hfType: 'Left-Sided HF', riskLevel: 'green', riskScore: 15, medications: ['Furosemide', 'Lisinopril', 'Metoprolol'], lastSync: '1 hr ago', alerts: 0 },
  { id: '4', name: 'James Whitfield', age: 80, hfType: 'Right-Sided HF', riskLevel: 'yellow', riskScore: 52, medications: ['Digoxin', 'Warfarin', 'Furosemide'], lastSync: '30 min ago', alerts: 2 },
  { id: '5', name: 'Sarah Kim', age: 61, hfType: 'HFrEF', riskLevel: 'green', riskScore: 12, medications: ['Metoprolol', 'Apixaban'], lastSync: '2 hr ago', alerts: 0 },
  { id: '6', name: 'David Okafor', age: 74, hfType: 'HFpEF', riskLevel: 'red', riskScore: 72, medications: ['Amiodarone', 'Furosemide', 'Spironolactone'], lastSync: '8 min ago', alerts: 4 },
];
