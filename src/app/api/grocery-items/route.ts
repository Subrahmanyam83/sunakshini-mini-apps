import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getFileOrDefault, updateFile } from "@/lib/github";
import { GroceryItem } from "@/lib/use-grocery-items";

const SHARED_ITEMS_PATH = "src/app/groceries/data/items.json";
// Personal file of the primary user — used as seed if shared file doesn't exist yet
const SEED_PATH = "src/app/groceries/users/saineelimab1/items.json";
const PRIVILEGED_EMAILS = ["gibraltor999@gmail.com", "saineelimab1@gmail.com"];

async function getUserInfo() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const name = email.split("@")[0] ?? "unknown";
  return { email, name };
}

export async function GET() {
  try {
    const { email, name } = await getUserInfo();

    if (PRIVILEGED_EMAILS.includes(email)) {
      // Try shared file first
      const shared = await getFileOrDefault<GroceryItem[]>(SHARED_ITEMS_PATH, []);
      const parsed: GroceryItem[] = JSON.parse(shared.content);

      // Shared file exists and has data — return it
      if (shared.sha && Array.isArray(parsed)) {
        return NextResponse.json(parsed);
      }

      // Shared file is missing/empty — seed it from saineelimab1's personal file
      const seed = await getFileOrDefault<GroceryItem[]>(SEED_PATH, []);
      const seedData: GroceryItem[] = JSON.parse(seed.content);
      if (seedData.length > 0) {
        // Migrate: write seed data into the shared file so both users see it
        await updateFile(SHARED_ITEMS_PATH, JSON.stringify(seedData, null, 2) + "\n", "", "chore: migrate grocery items to shared file");
      }
      return NextResponse.json(seedData);
    }

    const path = `src/app/groceries/users/${name}/items.json`;
    const { content } = await getFileOrDefault<GroceryItem[]>(path, []);
    return NextResponse.json(JSON.parse(content));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load grocery items" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { email, name } = await getUserInfo();
    const items: GroceryItem[] = await req.json();

    const path = PRIVILEGED_EMAILS.includes(email)
      ? SHARED_ITEMS_PATH
      : `src/app/groceries/users/${name}/items.json`;

    const { sha } = await getFileOrDefault<GroceryItem[]>(path, []);
    await updateFile(path, JSON.stringify(items, null, 2) + "\n", sha, "chore: update grocery items");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save grocery items" }, { status: 500 });
  }
}
