"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface GroceryItem {
  id: string;
  name: string;
  bought: boolean;
}

async function fetchItems(): Promise<GroceryItem[]> {
  const res = await fetch("/api/grocery-items", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load grocery items");
  return res.json();
}

async function pushItems(items: GroceryItem[]): Promise<void> {
  const res = await fetch("/api/grocery-items", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  });
  if (!res.ok) throw new Error("Failed to save grocery items");
}

export function useGroceryItems() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchItems()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const updateItems = useCallback((updater: (prev: GroceryItem[]) => GroceryItem[]) => {
    setItems((prev) => {
      const next = updater(prev);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        pushItems(next).catch((e) => console.error("Save failed:", e));
      }, 500);
      return next;
    });
  }, []);

  const addItem = useCallback((name: string) => {
    updateItems((prev) => {
      if (prev.some((i) => i.name.toLowerCase() === name.toLowerCase() && !i.bought)) return prev;
      return [...prev, { id: crypto.randomUUID(), name, bought: false }];
    });
  }, [updateItems]);

  const toggleItem = useCallback((id: string) => {
    updateItems((prev) => prev.map((i) => i.id === id ? { ...i, bought: !i.bought } : i));
  }, [updateItems]);

  const clearBought = useCallback(() => {
    updateItems((prev) => prev.filter((i) => !i.bought));
  }, [updateItems]);

  const renameItem = useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    updateItems((prev) => prev.map((i) => i.id === id ? { ...i, name: trimmed } : i));
  }, [updateItems]);

  return { items, loading, error, addItem, toggleItem, clearBought, renameItem };
}
