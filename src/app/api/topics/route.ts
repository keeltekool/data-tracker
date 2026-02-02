import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { topics } from "@/lib/schema";
import { desc } from "drizzle-orm";

const TOPIC_LIMIT = 20;

// GET /api/topics - List all topics
export async function GET() {
  try {
    const allTopics = await db
      .select()
      .from(topics)
      .orderBy(desc(topics.createdAt));

    return NextResponse.json({ topics: allTopics });
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics", topics: [] },
      { status: 500 }
    );
  }
}

// POST /api/topics - Create a new topic
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword } = body;

    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      );
    }

    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword.length === 0 || trimmedKeyword.length > 255) {
      return NextResponse.json(
        { error: "Keyword must be 1-255 characters" },
        { status: 400 }
      );
    }

    // Check topic limit
    const existingTopics = await db.select().from(topics);
    if (existingTopics.length >= TOPIC_LIMIT) {
      return NextResponse.json(
        { error: `Maximum ${TOPIC_LIMIT} topics allowed` },
        { status: 400 }
      );
    }

    // Check for duplicate
    const duplicate = existingTopics.find(
      (t) => t.keyword.toLowerCase() === trimmedKeyword.toLowerCase()
    );
    if (duplicate) {
      return NextResponse.json(
        { error: "Topic already exists" },
        { status: 400 }
      );
    }

    const [newTopic] = await db
      .insert(topics)
      .values({ keyword: trimmedKeyword })
      .returning();

    return NextResponse.json({ topic: newTopic }, { status: 201 });
  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json(
      { error: "Failed to create topic" },
      { status: 500 }
    );
  }
}
