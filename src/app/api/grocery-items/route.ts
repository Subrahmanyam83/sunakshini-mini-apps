import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getFileOrDefault, updateFile } from "@/lib/github";
import { GroceryItem } from "@/lib/use-grocery-items";

async function getUserPath() {
  const user = await currentUser();
  const name = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ?? "unknown";
  return `data/groceries/users/${name}/items.json`;
}

export async function GET() {
  try {
    const path = await getUserPath();
    const { content } = await getFileOrDefault<GroceryItem[]>(path, []);
    return NextResponse.json(JSON.parse(content));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load grocery items" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const path = await getUserPath();
    const items: GroceryItem[] = await req.json();
    const { sha } = await getFileOrDefault<GroceryItem[]>(path, []);
    await updateFile(path, JSON.stringify(items, null, 2) + "\n", sha, "chore: update grocery items");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save grocery items" }, { status: 500 });
  }
}
