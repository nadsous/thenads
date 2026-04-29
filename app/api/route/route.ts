import { NextRequest, NextResponse } from "next/server";

// In-memory cache (per-server lifetime)
const cache = new Map<
  string,
  { ts: number; data: { coordinates: [number, number][]; duration: number; distance: number } }
>();
const TTL = 1000 * 60 * 60 * 12; // 12h

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const coordsStr = sp.get("coords");
  const profile = (sp.get("profile") ?? "foot").trim();
  if (!coordsStr) {
    return NextResponse.json({ error: "coords required" }, { status: 400 });
  }
  const safeProfile = ["foot", "bike", "car"].includes(profile) ? profile : "foot";
  const cacheKey = `${safeProfile}:${coordsStr}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json(cached.data);
  }

  // OSRM expects: lng,lat;lng,lat;...
  const url = `https://router.project-osrm.org/route/v1/${safeProfile}/${coordsStr}?overview=full&geometries=geojson&steps=false`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "thenads/1.0 (travel planner)" },
      next: { revalidate: 60 * 60 * 12 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `OSRM ${res.status}`, fallback: true },
        { status: 200 }
      );
    }
    const data = await res.json();
    if (!data.routes?.[0]) {
      return NextResponse.json({ error: "no route", fallback: true }, { status: 200 });
    }
    const r = data.routes[0];
    const out = {
      coordinates: r.geometry.coordinates as [number, number][],
      duration: r.duration as number,
      distance: r.distance as number,
    };
    cache.set(cacheKey, { ts: Date.now(), data: out });
    return NextResponse.json(out);
  } catch (e) {
    return NextResponse.json(
      { error: "fetch_failed", message: (e as Error).message, fallback: true },
      { status: 200 }
    );
  }
}
