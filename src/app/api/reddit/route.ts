import { NextRequest, NextResponse } from "next/server";
import { fetchRedditPosts } from "@/lib/reddit";

// GET /api/reddit?topic={keyword}&hours={hours} - Fetch Reddit posts for a topic
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const topic = searchParams.get("topic");
    const hours = parseInt(searchParams.get("hours") || "24", 10);

    if (!topic) {
      return NextResponse.json(
        { error: "Topic parameter is required", items: [] },
        { status: 400 }
      );
    }

    const items = await fetchRedditPosts(topic, hours);

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching Reddit posts:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch Reddit posts",
        items: []
      },
      { status: 500 }
    );
  }
}
