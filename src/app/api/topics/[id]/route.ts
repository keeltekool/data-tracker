import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { topics } from "@/lib/schema";
import { eq } from "drizzle-orm";

// PUT /api/topics/[id] - Update a topic
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const topicId = parseInt(id, 10);

    if (isNaN(topicId)) {
      return NextResponse.json({ error: "Invalid topic ID" }, { status: 400 });
    }

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

    // Check if topic exists
    const existing = await db
      .select()
      .from(topics)
      .where(eq(topics.id, topicId));

    if (existing.length === 0) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Check for duplicate (excluding current topic)
    const allTopics = await db.select().from(topics);
    const duplicate = allTopics.find(
      (t) =>
        t.id !== topicId &&
        t.keyword.toLowerCase() === trimmedKeyword.toLowerCase()
    );
    if (duplicate) {
      return NextResponse.json(
        { error: "Topic already exists" },
        { status: 400 }
      );
    }

    const [updatedTopic] = await db
      .update(topics)
      .set({ keyword: trimmedKeyword, updatedAt: new Date() })
      .where(eq(topics.id, topicId))
      .returning();

    return NextResponse.json({ topic: updatedTopic });
  } catch (error) {
    console.error("Error updating topic:", error);
    return NextResponse.json(
      { error: "Failed to update topic" },
      { status: 500 }
    );
  }
}

// DELETE /api/topics/[id] - Delete a topic
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const topicId = parseInt(id, 10);

    if (isNaN(topicId)) {
      return NextResponse.json({ error: "Invalid topic ID" }, { status: 400 });
    }

    // Check if topic exists
    const existing = await db
      .select()
      .from(topics)
      .where(eq(topics.id, topicId));

    if (existing.length === 0) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    await db.delete(topics).where(eq(topics.id, topicId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting topic:", error);
    return NextResponse.json(
      { error: "Failed to delete topic" },
      { status: 500 }
    );
  }
}
