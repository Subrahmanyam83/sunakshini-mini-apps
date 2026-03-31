# Skill: Data Storage

All data in MiniApps is stored via the GitHub API. Never use localStorage.

## Rule

**Always use GitHub API for all data storage** — no exceptions.
- Data persists across devices and browsers
- Data survives clearing the browser
- All apps store their data in their own JSON file under `src/app/<app-name>/data/`

## File Location

Each app gets its own data file:
```
src/app/<app-name>/data/<app-name>.json
```
Examples:
- `src/app/alcohol/data/alcohol.json`
- `src/app/nutrition/data/nutrition.json`
- `src/app/groceries/data/grocery-items.json`

The path passed to the GitHub API must match exactly (e.g. `src/app/nutrition/data/nutrition.json`).

## GitHub API Pattern

Used via `src/lib/github.ts` — `getFile(path)` and `updateFile(path, content, sha, message)`.

Always call GitHub from an API route (`src/app/api/<app-name>/route.ts`), never from the client directly.

### API Route Pattern
```ts
import { NextRequest, NextResponse } from "next/server";
import { getFile, updateFile } from "@/lib/github";

const DATA_PATH = "src/app/<app-name>/data/<app-name>.json";

export async function GET() {
  const { content, sha } = await getFile(DATA_PATH);
  const data = JSON.parse(content);
  return NextResponse.json({ data, sha });
}

export async function PUT(req: NextRequest) {
  const { data, sha } = await req.json();
  await updateFile(DATA_PATH, JSON.stringify(data, null, 2) + "\n", sha, "Update <app-name> data");
  const { sha: newSha } = await getFile(DATA_PATH);
  return NextResponse.json({ success: true, sha: newSha });
}
```

### Client Hook Pattern
```ts
"use client";

import { useState, useEffect, useCallback } from "react";

export function useAppData() {
  const [data, setData] = useState(null);
  const [sha, setSha] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/<app-name>");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json.data);
      setSha(json.sha);
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveData = useCallback(async (next) => {
    const res = await fetch("/api/<app-name>", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: next, sha }),
    });
    if (!res.ok) throw new Error("Failed to save");
    const json = await res.json();
    setSha(json.sha);
    setData(next);
  }, [sha]);

  return { data, loading, error, fetchData, saveData };
}
```

## Initial Data File

Every app must have an initial empty JSON file committed to the repo at the correct path. Create it before building the API route.
