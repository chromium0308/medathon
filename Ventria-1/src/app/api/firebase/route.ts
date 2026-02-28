import { NextRequest, NextResponse } from "next/server";

const getDbUrl = () => {
  const url = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.trim();
  if (!url) return null;
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

/**
 * GET /api/firebase?userId=xxx
 * Load user dashboard data from Firebase Realtime Database.
 */
export async function GET(request: NextRequest) {
  const dbUrl = getDbUrl();
  if (!dbUrl) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId || !/^[a-zA-Z0-9_-]+$/.test(userId)) {
    return NextResponse.json({ error: "Valid userId required" }, { status: 400 });
  }
  try {
    const res = await fetch(`${dbUrl}/users/${userId}.json`);
    if (!res.ok) throw new Error(`Firebase ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data ?? {});
  } catch (e) {
    console.error("Firebase GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load" },
      { status: 502 }
    );
  }
}

/**
 * POST /api/firebase
 * Body: { userId: string, data: object, merge?: boolean }
 * Save user data. If merge is true, merge data into existing document.
 */
export async function POST(request: NextRequest) {
  const dbUrl = getDbUrl();
  if (!dbUrl) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }
  let body: { userId?: string; data?: Record<string, unknown>; merge?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const userId = body.userId;
  const data = body.data;
  if (!userId || !/^[a-zA-Z0-9_-]+$/.test(userId)) {
    return NextResponse.json({ error: "Valid userId required" }, { status: 400 });
  }
  if (data == null || typeof data !== "object") {
    return NextResponse.json({ error: "data object required" }, { status: 400 });
  }
  try {
    let payload: Record<string, unknown> = { ...data, updatedAt: new Date().toISOString() };
    if (body.merge) {
      const getRes = await fetch(`${dbUrl}/users/${userId}.json`);
      const existing = (getRes.ok && (await getRes.json())) || {};
      payload = { ...existing, ...data, updatedAt: new Date().toISOString() };
    }
    const res = await fetch(`${dbUrl}/users/${userId}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Firebase ${res.status}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Firebase POST error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save" },
      { status: 502 }
    );
  }
}
