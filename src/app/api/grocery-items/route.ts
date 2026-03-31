import { NextRequest, NextResponse } from "next/server";
import { getFile, updateFile } from "@/lib/github";
import { GroceryItem } from "@/lib/use-grocery-items";

const DATA_PATH = "src/app/groceries/data/grocery-items.json";

export async function GET() {
  try {
    const { content } = await getFile(DATA_PATH);
    return NextResponse.json(JSON.parse(content));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load grocery items" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const items: GroceryItem[] = await req.json();
    const { sha } = await getFile(DATA_PATH);
    await updateFile(DATA_PATH, JSON.stringify(items, null, 2) + "\n", sha, "chore: update grocery items");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save grocery items" }, { status: 500 });
  }
}
