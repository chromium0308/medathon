import { NextRequest, NextResponse } from "next/server";
import {
  upsertSync,
  getSyncByDeviceId,
  getSyncBySyncCode,
  type SyncPayload,
} from "@/lib/syncStore";

/**
 * POST /api/sync
 * Receives Apple Watch data from CardioGuard app (SyncService.swift).
 * Returns { syncCode?: string } if the server assigned/updated a sync code for pairing.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const deviceId = body?.deviceId;
    if (!deviceId || typeof deviceId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid deviceId" },
        { status: 400 }
      );
    }

    const payload: SyncPayload = {
      deviceId,
      syncCode: body.syncCode ?? null,
      profile: body.profile ?? null,
      metrics: body.metrics ?? null,
      symptoms: body.symptoms ?? null,
      alerts: body.alerts ?? null,
      liveHR: body.liveHR ?? null,
      liveHRV: body.liveHRV ?? null,
      riskScore: body.riskScore ?? null,
      riskLevel: body.riskLevel ?? null,
    };

    const stored = upsertSync(payload);
    const res: { syncCode?: string } = {};
    if (stored.payload.syncCode) {
      res.syncCode = stored.payload.syncCode;
    }
    return NextResponse.json(res);
  } catch (e) {
    console.error("Sync POST error:", e);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

/**
 * GET /api/sync?deviceId=... or ?syncCode=...
 * Returns the latest sync data for the Ventria dashboard (Apple Watch import).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("deviceId");
  const syncCode = searchParams.get("syncCode");

  if (deviceId) {
    const stored = getSyncByDeviceId(deviceId);
    if (!stored)
      return NextResponse.json(
        { error: "No sync data for this device" },
        { status: 404 }
      );
    return NextResponse.json({
      ...stored.payload,
      lastSyncedAt: stored.lastSyncedAt,
    });
  }

  if (syncCode) {
    const stored = getSyncBySyncCode(syncCode);
    if (!stored)
      return NextResponse.json(
        { error: "No sync data for this code" },
        { status: 404 }
      );
    return NextResponse.json({
      ...stored.payload,
      lastSyncedAt: stored.lastSyncedAt,
    });
  }

  return NextResponse.json(
    { error: "Provide deviceId or syncCode" },
    { status: 400 }
  );
}
