// Lightweight routing helpers — walk via OSRM (real streets),
// transit via heuristic (Budapest BKK average speeds).

export type Leg = {
  fromId: string;
  toId: string;
  distanceM: number;
  durationS: number;
  geometry: [number, number][]; // [lng, lat]
  mode: "walk" | "transit";
  transit?: {
    type: "metro" | "tram" | "bus" | "mixed";
    label: string; // e.g. "M1 + tram 4"
    priceHuf: number;
    priceEur: number;
  };
};

export type LatLng = { lat: number; lng: number; id: string };

// Haversine — great-circle distance in meters
export function haversine(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

async function osrmFetch(
  a: LatLng,
  b: LatLng,
  profile: "foot",
  signal?: AbortSignal
): Promise<{ coordinates: [number, number][]; distance: number; duration: number } | null> {
  const coords = `${a.lng},${a.lat};${b.lng},${b.lat}`;
  try {
    const res = await fetch(
      `/api/route?coords=${encodeURIComponent(coords)}&profile=${profile}`,
      { signal }
    );
    const data = await res.json();
    if (data.coordinates) {
      return { coordinates: data.coordinates, distance: data.distance, duration: data.duration };
    }
  } catch {
    // aborted or network — caller falls back
  }
  return null;
}

export async function osrmFootLeg(
  a: LatLng,
  b: LatLng,
  signal?: AbortSignal
): Promise<Leg> {
  const data = await osrmFetch(a, b, "foot", signal);
  if (data) {
    return {
      fromId: a.id,
      toId: b.id,
      distanceM: data.distance,
      durationS: data.duration,
      geometry: data.coordinates,
      mode: "walk",
    };
  }
  const d = haversine(a, b) * 1.3;
  return {
    fromId: a.id,
    toId: b.id,
    distanceM: d,
    durationS: Math.round(d / 1.35),
    geometry: [
      [a.lng, a.lat],
      [b.lng, b.lat],
    ],
    mode: "walk",
  };
}

// Budapest transit heuristic (BKK):
//   - average effective speed door-to-door (incl. wait, walk to/from stop) ≈ 16-22 km/h
//   - we use 18 km/h + 4 min penalty (walk + wait)
//   - single ticket: 450 HUF (~1,15 €), 10-pack: 4 000 HUF (~10 €)
//   - geometry uses OSRM "car" profile so the line follows actual streets
export async function transitLeg(
  a: LatLng,
  b: LatLng,
  signal?: AbortSignal
): Promise<Leg> {
  const dM = haversine(a, b);
  const speedMS = 18000 / 3600;
  const totalS = Math.round(dM / speedMS + 4 * 60);

  let type: "metro" | "tram" | "bus" | "mixed" = "tram";
  let label = "Tram";
  if (dM > 4000) {
    type = "mixed";
    label = "Métro + tram";
  } else if (dM > 2000) {
    type = "metro";
    label = "Métro M1/M2/M3";
  } else if (dM > 800) {
    type = "tram";
    label = "Tram 4 / 6";
  } else {
    type = "bus";
    label = "Bus / Tram court";
  }

  // Transit mode: draw a smooth curved line A→B (not a real route — we don't
  // have free transit routing). The bus/tram info is displayed in the overlay
  // text instead. Curve avoids the perception of "cutting through buildings".
  void signal;
  const geometry = curvedBezier(a, b, 32);

  return {
    fromId: a.id,
    toId: b.id,
    distanceM: dM,
    durationS: totalS,
    geometry,
    mode: "transit",
    transit: {
      type,
      label,
      priceHuf: 450,
      priceEur: 1.15,
    },
  };
}

// Build a quadratic-bezier-like curve between two points so the polyline
// looks like a connection arc rather than crossing buildings in a straight line.
function curvedBezier(a: LatLng, b: LatLng, steps: number): [number, number][] {
  const mx = (a.lng + b.lng) / 2;
  const my = (a.lat + b.lat) / 2;
  // Perpendicular offset for a gentle curve (smaller for closer points)
  const dx = b.lng - a.lng;
  const dy = b.lat - a.lat;
  const len = Math.hypot(dx, dy) || 1;
  const off = Math.min(0.0025, len * 0.18); // ~250m max
  const cx = mx + (-dy / len) * off;
  const cy = my + (dx / len) * off;
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) ** 2 * a.lng + 2 * (1 - t) * t * cx + t ** 2 * b.lng;
    const y = (1 - t) ** 2 * a.lat + 2 * (1 - t) * t * cy + t ** 2 * b.lat;
    pts.push([x, y]);
  }
  return pts;
}

// Nearest-neighbor reorder of a list of LatLng items to minimize total walking
// distance. Anchors on the first item (typically the place opening earliest).
// Not optimal in general, but reliable, fast, and removes the obvious detours.
export function nearestNeighborOrder<T extends LatLng>(items: T[]): T[] {
  if (items.length < 3) return items.slice();
  const remaining = items.slice();
  const ordered: T[] = [];
  let current = remaining.shift()!;
  ordered.push(current);
  while (remaining.length) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversine(current, remaining[i]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    current = remaining.splice(bestIdx, 1)[0];
    ordered.push(current);
  }
  return ordered;
}

// Total walking distance (meters) of a path through the given points (in order).
export function totalWalkDistance(items: LatLng[]): number {
  let sum = 0;
  for (let i = 0; i < items.length - 1; i++) sum += haversine(items[i], items[i + 1]);
  return sum;
}

export function formatDuration(s: number): string {
  if (s < 60) return `${Math.round(s)} s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}

export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(m < 10000 ? 1 : 0)} km`;
}
