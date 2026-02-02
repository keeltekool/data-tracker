import { NextRequest, NextResponse } from "next/server";
import { fetchRedditPosts } from "@/lib/reddit";

// GET /api/reddit?topic={keyword} - Fetch Reddit posts for a topic
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

    const items = await fetchRedditPosts(topic);

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
