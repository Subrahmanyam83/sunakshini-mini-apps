import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getFileOrDefault, updateFile } from "@/lib/github";
import { analyzeEntries, filterByDateRange, groupByDate } from "@/lib/alcohol-analysis";
import { AlcoholData, AlcoholEntry, DrinkType, DrinkUnit } from "@/types/alcohol";

const DEFAULT_ALCOHOL: AlcoholData = { entries: [] };

const UNIT_ML: Record<DrinkUnit, number> = {
  "300ml": 300,
  peg: 30,
};

// Both privileged users share one neutral file — changes from either are visible to both.
// On first access, the shared file is seeded from gibraltor999's existing personal data.
const SHARED_PATH = "src/app/sip-log/data/data.json";
const SEED_PATH = "src/app/sip-log/users/gibraltor999/data.json";
const PRIVILEGED_EMAILS = ["gibraltor999@gmail.com", "saineelimab1@gmail.com"];

async function getUserInfo() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const name = email.split("@")[0] ?? "unknown";
  return { email, name };
}

function getDataPath(email: string, name: string) {
  if (PRIVILEGED_EMAILS.includes(email)) return SHARED_PATH;
  return `src/app/sip-log/users/${name}/data.json`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const { email, name } = await getUserInfo();

    let path: string;
    let data: AlcoholData;

    if (PRIVILEGED_EMAILS.includes(email)) {
      // Try shared file first
      const shared = await getFileOrDefault<AlcoholData>(SHARED_PATH, DEFAULT_ALCOHOL);
      const parsed: AlcoholData = JSON.parse(shared.content);

      // Shared file exists and has data — use it
      if (shared.sha && parsed.entries.length > 0) {
        path = SHARED_PATH;
        data = parsed;
      } else {
        // Shared file is missing/empty — seed it from gibraltor999's personal file
        path = SHARED_PATH;
        const seed = await getFileOrDefault<AlcoholData>(SEED_PATH, DEFAULT_ALCOHOL);
        const seedData: AlcoholData = JSON.parse(seed.content);
        if (seedData.entries.length > 0) {
          await updateFile(SHARED_PATH, JSON.stringify(seedData, null, 2) + "\n", shared.sha, "chore: migrate alcohol data to shared file");
          data = seedData;
        } else {
          data = DEFAULT_ALCOHOL;
        }
      }
    } else {
      path = getDataPath(email, name);
      const { content } = await getFileOrDefault<AlcoholData>(path, DEFAULT_ALCOHOL);
      data = JSON.parse(content);
    }

    const allEntries = data.entries;
    const earliest = allEntries.length > 0 ? allEntries.map((e) => e.date).sort()[0] : new Date().toISOString().split("T")[0];
    const rangeFrom = from ?? earliest;
    const rangeTo = to ?? new Date().toISOString().split("T")[0];

    const filtered = filterByDateRange(allEntries, rangeFrom, rangeTo);
    const analysis = analyzeEntries(allEntries, rangeFrom, rangeTo);
    const chartData = groupByDate(filtered);

    return NextResponse.json({ entries: filtered, analysis, chartData, allEntries });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, type, quantity, unit } = body as { date: string; type: DrinkType; quantity: number; unit: DrinkUnit };

    if (!date || !type || !quantity || !unit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const customMl: number | undefined = body.customMl ? Number(body.customMl) : undefined;
    const unitMl = customMl ?? UNIT_ML[unit];
    const totalMl = quantity * unitMl;
    const newEntry: AlcoholEntry = { id: new Date().toISOString(), date, type, quantity: Number(quantity), unit, ...(customMl ? { customMl } : {}), totalMl };

    const { email, name } = await getUserInfo();
    const path = getDataPath(email, name);
    const { content, sha } = await getFileOrDefault<AlcoholData>(path, DEFAULT_ALCOHOL);
    const data: AlcoholData = JSON.parse(content);
    data.entries.push(newEntry);
    data.entries.sort((a, b) => a.date.localeCompare(b.date));
    await updateFile(path, JSON.stringify(data, null, 2) + "\n", sha, `Add ${type} entry for ${date}`);
    return NextResponse.json({ success: true, entry: newEntry });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save entry" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, date, type, quantity, unit } = body as { id: string; date: string; type: DrinkType; quantity: number; unit: DrinkUnit };

    if (!id || !date || !type || !quantity || !unit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { email, name } = await getUserInfo();
    const path = getDataPath(email, name);
    const { content, sha } = await getFileOrDefault<AlcoholData>(path, DEFAULT_ALCOHOL);
    const data: AlcoholData = JSON.parse(content);
    const idx = data.entries.findIndex((e) => e.id === id);
    if (idx === -1) return NextResponse.json({ error: "Entry not found" }, { status: 404 });

    const editCustomMl: number | undefined = body.customMl ? Number(body.customMl) : undefined;
    const editUnitMl = editCustomMl ?? UNIT_ML[unit];
    data.entries[idx] = { id, date, type, quantity: Number(quantity), unit, ...(editCustomMl ? { customMl: editCustomMl } : {}), totalMl: Number(quantity) * editUnitMl };
    data.entries.sort((a, b) => a.date.localeCompare(b.date));
    await updateFile(path, JSON.stringify(data, null, 2) + "\n", sha, `Update ${type} entry for ${date}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { email, name } = await getUserInfo();
    const path = getDataPath(email, name);
    const { content, sha } = await getFileOrDefault<AlcoholData>(path, DEFAULT_ALCOHOL);
    const data: AlcoholData = JSON.parse(content);
    data.entries = data.entries.filter((e) => e.id !== id);
    await updateFile(path, JSON.stringify(data, null, 2) + "\n", sha, `Delete entry ${id}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}
