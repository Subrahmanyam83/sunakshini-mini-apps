import { NextRequest, NextResponse } from "next/server";
import { getFile, updateFile } from "@/lib/github";
import { NutritionData } from "@/lib/use-nutrition";

const DATA_PATH = "src/app/nutrition/data/nutrition.json";

export async function GET() {
  try {
    const { content, sha } = await getFile(DATA_PATH);
    const data: NutritionData = JSON.parse(content);
    return NextResponse.json({ data, sha });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load nutrition data" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { data, sha } = await req.json() as { data: NutritionData; sha: string };
    const newContent = JSON.stringify(data, null, 2) + "\n";
    await updateFile(DATA_PATH, newContent, sha, "Update nutrition data");
    // Fetch the new sha
    const { sha: newSha } = await getFile(DATA_PATH);
    return NextResponse.json({ success: true, sha: newSha });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save nutrition data" }, { status: 500 });
  }
}
