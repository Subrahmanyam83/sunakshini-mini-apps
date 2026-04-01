import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getFile, getFileOrDefault, updateFile } from "@/lib/github";
import { MasterCategory } from "@/lib/use-master-list";

const SHARED_DATA_PATH = "src/app/groceries/data/master-categories.json";
const PRIVILEGED_EMAILS = ["gibraltor999@gmail.com", "saineelimb1@gmail.com", "saineelimab1@gmail.com"];

async function getUserInfo() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const name = user?.firstName ?? email.split("@")[0] ?? "unknown";
  return { email, name };
}

export async function GET() {
  try {
    const { email, name } = await getUserInfo();
    const userPath = `src/app/groceries/users/${name}/master-categories.json`;

    // Try personal file first
    try {
      const { content } = await getFile(userPath);
      return NextResponse.json(JSON.parse(content));
    } catch {
      // Privileged users fall back to shared master list
      if (PRIVILEGED_EMAILS.includes(email)) {
        const { content } = await getFile(SHARED_DATA_PATH);
        return NextResponse.json(JSON.parse(content));
      }
      // Everyone else starts empty
      return NextResponse.json([]);
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load master categories" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { name } = await getUserInfo();
    const userPath = `src/app/groceries/users/${name}/master-categories.json`;
    const categories: MasterCategory[] = await req.json();
    const { sha } = await getFileOrDefault<MasterCategory[]>(userPath, []);
    await updateFile(userPath, JSON.stringify(categories, null, 2) + "\n", sha, "chore: update master categories");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save master categories" }, { status: 500 });
  }
}
