import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const country = searchParams.get("country");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const size = searchParams.get("size") ?? "20";

  if (!city) {
    return NextResponse.json(
      { error: "Missing city parameter" },
      { status: 400 }
    );
  }

  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Ticketmaster API key not configured" },
      { status: 500 }
    );
  }

  const tmUrl = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
  tmUrl.searchParams.set("apikey", apiKey);
  tmUrl.searchParams.set("city", city);
  tmUrl.searchParams.set("size", size);
  tmUrl.searchParams.set("sort", "date,asc");

  if (country) tmUrl.searchParams.set("countryCode", country);
  if (startDate) tmUrl.searchParams.set("startDateTime", `${startDate}T00:00:00Z`);
  if (endDate) tmUrl.searchParams.set("endDateTime", `${endDate}T23:59:59Z`);

  try {
    const res = await fetch(tmUrl.toString(), { next: { revalidate: 300 } });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Ticketmaster API error", details: text },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Fetch failed", details: String(err) },
      { status: 500 }
    );
  }
}
