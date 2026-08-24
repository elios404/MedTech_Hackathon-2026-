import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { VisionInferenceEvent } from "@/types/vision";

export async function GET() {
  try {
    // Path to data/events.jsonl in workspace root
    const rootDir = path.resolve(process.cwd(), "..");
    const logPath = path.join(rootDir, "data", "events.jsonl");

    if (!fs.existsSync(logPath)) {
      return NextResponse.json({
        success: true,
        events: [],
        stats: { total: 0, misclassified: 0, misclassRate: 0 }
      });
    }

    const fileContent = fs.readFileSync(logPath, "utf-8");
    const lines = fileContent.trim().split("\n").filter((l) => l.trim().length > 0);

    const events: VisionInferenceEvent[] = [];
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        events.push(parsed);
      } catch (e) {
        // skip corrupted lines
      }
    }

    // Sort descending by timestamp
    events.reverse();

    const total = events.length;
    const misclassified = events.filter((e) => e.is_misclassified).length;
    const misclassRate = total > 0 ? (misclassified / total) * 100 : 0;

    return NextResponse.json({
      success: true,
      events: events.slice(0, 50), // latest 50 events
      stats: {
        total,
        misclassified,
        misclassRate: Number(misclassRate.toFixed(1)),
        latestEvent: events[0] || null
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}
