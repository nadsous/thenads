// Sunrise / sunset / solar-noon calculator (NOAA simplified algorithm).
// No external API — works offline, accurate to ~1 minute.
// Inputs: date (UTC midnight is fine), latitude °, longitude °.
// Output: { sunrise, sunset, dayLengthMin } — Date objects in local time.

const RAD = Math.PI / 180;

function julianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

function fromJulian(j: number): Date {
  return new Date((j - 2440587.5) * 86400000);
}

function toDays(date: Date): number {
  return julianDay(date) - 2451545.0;
}

function solarMeanAnomaly(d: number): number {
  return RAD * (357.5291 + 0.98560028 * d);
}

function eclipticLongitude(M: number): number {
  const C =
    RAD *
    (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const P = RAD * 102.9372;
  return M + C + P + Math.PI;
}

function declination(L: number, B: number): number {
  const e = RAD * 23.4397;
  return Math.asin(Math.sin(B) * Math.cos(e) + Math.cos(B) * Math.sin(e) * Math.sin(L));
}

function julianCycle(d: number, lw: number): number {
  return Math.round(d - 0.0009 - lw / (2 * Math.PI));
}

function approxTransit(Ht: number, lw: number, n: number): number {
  return 0.0009 + (Ht + lw) / (2 * Math.PI) + n;
}

function solarTransitJ(ds: number, M: number, L: number): number {
  return 2451545 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
}

function hourAngle(h: number, phi: number, d: number): number {
  return Math.acos((Math.sin(h) - Math.sin(phi) * Math.sin(d)) / (Math.cos(phi) * Math.cos(d)));
}

export type SunTimes = {
  sunrise: Date;
  sunset: Date;
  dayLengthMin: number;
};

export function getSunTimes(date: Date, lat: number, lng: number): SunTimes | null {
  const lw = RAD * -lng;
  const phi = RAD * lat;
  const d = toDays(date);
  const n = julianCycle(d, lw);
  const ds = approxTransit(0, lw, n);

  const M = solarMeanAnomaly(ds);
  const L = eclipticLongitude(M);
  const dec = declination(L, 0);

  const Jnoon = solarTransitJ(ds, M, L);
  // h = -0.833° (standard for sunrise/sunset accounting for atm refraction)
  const h0 = RAD * -0.833;
  const cosArg =
    (Math.sin(h0) - Math.sin(phi) * Math.sin(dec)) /
    (Math.cos(phi) * Math.cos(dec));
  if (cosArg < -1 || cosArg > 1) {
    // Polar day or polar night
    return null;
  }
  const w0 = hourAngle(h0, phi, dec);
  const Jset = solarTransitJ(approxTransit(w0, lw, n), M, L);
  const Jrise = Jnoon - (Jset - Jnoon);

  const sunrise = fromJulian(Jrise);
  const sunset = fromJulian(Jset);
  const dayLengthMin = Math.round((sunset.getTime() - sunrise.getTime()) / 60000);
  return { sunrise, sunset, dayLengthMin };
}

export function formatTimeFr(d: Date): string {
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

// Centroid (mean lat/lng) of a list of points — useful when the trip's city
// coordinates aren't stored explicitly.
export function centroid(
  points: Array<{ lat: number; lng: number }>
): { lat: number; lng: number } | null {
  if (!points.length) return null;
  let sLat = 0;
  let sLng = 0;
  for (const p of points) {
    sLat += p.lat;
    sLng += p.lng;
  }
  return { lat: sLat / points.length, lng: sLng / points.length };
}
