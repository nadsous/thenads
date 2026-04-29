import { NextRequest, NextResponse } from "next/server";

// Cache geocoding results for 24h to be a good Nominatim citizen.
const cache = new Map<string, { ts: number; data: GeocodeResult[] }>();
const TTL = 1000 * 60 * 60 * 24;

type GeocodeResult = {
  lat: number;
  lng: number;
  displayName: string;
  city?: string;
  country?: string;
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 3) {
    return NextResponse.json({ results: [] });
  }
  const key = q.toLowerCase();
  const c = cache.get(key);
  if (c && Date.now() - c.ts < TTL) {
    return NextResponse.json({ results: c.data });
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "5");
    url.searchParams.set("accept-language", "fr,en");

    const res = await fetch(url, {
      headers: {
        "User-Agent": "thenads/1.0 (travel planner; contact: nadirtounsifr@gmail.com)",
      },
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) {
      return NextResponse.json({ results: [], error: `nominatim ${res.status}` });
    }
    const raw = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
      address?: { city?: string; town?: string; village?: string; country?: string };
    }>;
    const data: GeocodeResult[] = raw.map((r) => ({
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      displayName: r.display_name,
      city: r.address?.city ?? r.address?.town ?? r.address?.village,
      country: r.address?.country,
    }));
    cache.set(key, { ts: Date.now(), data });
    return NextResponse.json({ results: data });
  } catch (e) {
    return NextResponse.json({ results: [], error: (e as Error).message });
  }
}
