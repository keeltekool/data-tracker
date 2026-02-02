import { NextRequest, NextResponse } from "next/server";
import { fetchGoogleNewsRSS } from "@/lib/google-news";

// GET /api/news?topic={keyword} - Fetch Google News RSS feed for a topic
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const topic = searchParams.get("topic");

    if (!topic) {
      return NextResponse.json(
        { error: "Topic parameter is required", items: [] },
        { status: 400 }
      );
    }

    const items = await fetchGoogleNewsRSS(topic);

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching news RSS:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch news",
        items: []
      },
      { status: 500 }
    );
  }
}
