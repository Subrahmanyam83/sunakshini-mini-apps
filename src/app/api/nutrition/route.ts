import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getFileOrDefault, updateFile, getFile } from "@/lib/github";
import { NutritionData } from "@/lib/use-nutrition";

const DEFAULT_NUTRITION: NutritionData = { members: [], logs: [] };

async function getUserPath() {
  const user = await currentUser();
  const name = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ?? "unknown";
  return `src/app/nutrition/users/${name}/data.json`;
}

export async function GET() {
  try {
    const path = await getUserPath();
    const { content, sha } = await getFileOrDefault<NutritionData>(path, DEFAULT_NUTRITION);
    const data: NutritionData = JSON.parse(content);
    return NextResponse.json({ data, sha });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load nutrition data" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const path = await getUserPath();
    const { data, sha } = await req.json() as { data: NutritionData; sha: string };
    const newContent = JSON.stringify(data, null, 2) + "\n";
    await updateFile(path, newContent, sha, "Update nutrition data");
    const { sha: newSha } = await getFile(path);
    return NextResponse.json({ success: true, sha: newSha });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save nutrition data" }, { status: 500 });
  }
}
