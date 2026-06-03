import { NextResponse } from "next/server";

// Fetches live gold price in MYR per gram from public API
// Uses goldprice.org free API — no key required
// Falls back gracefully if unavailable
export async function GET() {
  try {
    const res = await fetch(
      "https://data-asg.goldprice.org/dbXRates/MYR",
      { next: { revalidate: 3600 } } // cache 1 hour
    );

    if (!res.ok) throw new Error("Upstream failed");

    const data = await res.json();
    // data.items[0].xauPrice = gold price per troy oz in MYR
    const pricePerOz   = data?.items?.[0]?.xauPrice;
    if (!pricePerOz) throw new Error("No price data");

    // 1 troy oz = 31.1035 grams
    const pricePerGram = pricePerOz / 31.1035;

    return NextResponse.json({
      pricePerGram: Math.round(pricePerGram * 100) / 100,
      pricePerOz:   Math.round(pricePerOz * 100) / 100,
      currency:     "MYR",
      source:       "goldprice.org",
      cachedAt:     new Date().toISOString(),
    });
  } catch {
    // Fallback — return null so UI handles gracefully
    return NextResponse.json({
      pricePerGram: null,
      pricePerOz:   null,
      currency:     "MYR",
      source:       null,
      error:        "Unable to fetch live gold price",
    });
  }
}
