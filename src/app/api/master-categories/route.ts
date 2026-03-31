import { NextRequest, NextResponse } from "next/server";
import { getFile, updateFile } from "@/lib/github";
import { MasterCategory } from "@/lib/use-master-list";

const DATA_PATH = "src/app/groceries/data/master-categories.json";

export async function GET() {
  try {
    const { content } = await getFile(DATA_PATH);
    return NextResponse.json(JSON.parse(content));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load master categories" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const categories: MasterCategory[] = await req.json();
    const { sha } = await getFile(DATA_PATH);
    await updateFile(DATA_PATH, JSON.stringify(categories, null, 2) + "\n", sha, "chore: update master categories");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save master categories" }, { status: 500 });
  }
}
