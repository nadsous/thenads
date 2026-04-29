import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { issueTripSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  const password: string = (body?.password ?? "").toString();

  const trip = await prisma.trip.findUnique({
    where: { slug },
    select: { id: true, passwordHash: true },
  });
  if (!trip) {
    return NextResponse.json({ ok: false, error: "Voyage introuvable" }, { status: 404 });
  }

  const ok = await bcrypt.compare(password, trip.passwordHash);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Mot de passe incorrect" }, { status: 401 });
  }

  await issueTripSession(trip.id);
  return NextResponse.json({ ok: true });
}
