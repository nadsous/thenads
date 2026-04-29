import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { issueTripSession } from "@/lib/auth";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name: string = (body.name ?? "").trim();
  const city: string = (body.city ?? "").trim();
  const country: string = (body.country ?? "").trim();
  const password: string = (body.password ?? "").trim();
  const startDate = body.startDate ? new Date(body.startDate) : null;
  const endDate = body.endDate ? new Date(body.endDate) : null;

  if (!name || !city || !password || !startDate || !endDate) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  // Generate a unique slug
  const base = slugify(`${name}-${city}`) || "voyage";
  let slug = base;
  let n = 2;
  while (await prisma.trip.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const trip = await prisma.trip.create({
    data: {
      slug,
      name,
      city,
      country: country || "—",
      coverEmoji: body.coverEmoji ?? "✈️",
      accentFrom: body.accentFrom ?? "#f59e0b",
      accentTo: body.accentTo ?? "#ec4899",
      startDate,
      endDate,
      passwordHash,
      notes: body.notes ?? null,
    },
  });

  // Auto-create days between start and end (one per calendar day)
  const palette = [
    ["#fb923c", "#f43f5e"],
    ["#6366f1", "#22d3ee"],
    ["#10b981", "#a3e635"],
    ["#f472b6", "#a78bfa"],
    ["#facc15", "#f97316"],
    ["#06b6d4", "#3b82f6"],
  ];
  const days: Array<{
    tripId: string;
    index: number;
    date: Date;
    label: string;
    colorFrom: string;
    colorTo: string;
  }> = [];
  const cursor = new Date(startDate);
  let i = 0;
  while (cursor <= endDate && i < 30) {
    const c = palette[i % palette.length];
    const dateStr = cursor.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    days.push({
      tripId: trip.id,
      index: i,
      date: new Date(cursor),
      label: dateStr.charAt(0).toUpperCase() + dateStr.slice(1),
      colorFrom: c[0],
      colorTo: c[1],
    });
    cursor.setDate(cursor.getDate() + 1);
    i++;
  }
  if (days.length) await prisma.day.createMany({ data: days });

  // Issue a session so the creator is auto-logged-in
  await issueTripSession(trip.id);

  return NextResponse.json({ ok: true, slug: trip.slug });
}
