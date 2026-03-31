"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface MasterCategory {
  id: string;
  name: string;
  items: { id: string; name: string }[];
}

async function fetchCategories(): Promise<MasterCategory[]> {
  const res = await fetch("/api/master-categories", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load master categories");
  return res.json();
}

async function pushCategories(categories: MasterCategory[]): Promise<void> {
  const res = await fetch("/api/master-categories", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categories),
  });
  if (!res.ok) throw new Error("Failed to save master categories");
}

export function useMasterList() {
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const update = useCallback((updater: (prev: MasterCategory[]) => MasterCategory[]) => {
    setCategories((prev) => {
      const next = updater(prev);
      // debounce saves so rapid edits don't fire multiple requests
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        pushCategories(next).catch((e) => console.error("Save failed:", e));
      }, 500);
      return next;
    });
  }, []);

  const addCategory = useCallback((name: string) => {
    update((prev) => [...prev, { id: crypto.randomUUID(), name, items: [] }]);
  }, [update]);

  const deleteCategory = useCallback((catId: string) => {
    update((prev) => prev.filter((c) => c.id !== catId));
  }, [update]);

  const renameCategory = useCallback((catId: string, name: string) => {
    update((prev) => prev.map((c) => c.id === catId ? { ...c, name } : c));
  }, [update]);

  const addItem = useCallback((catId: string, name: string) => {
    update((prev) => prev.map((c) =>
      c.id === catId ? { ...c, items: [...c.items, { id: crypto.randomUUID(), name }] } : c
    ));
  }, [update]);

  const deleteItem = useCallback((catId: string, itemId: string) => {
    update((prev) => prev.map((c) =>
      c.id === catId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c
    ));
  }, [update]);

  const renameItem = useCallback((catId: string, itemId: string, name: string) => {
    update((prev) => prev.map((c) =>
      c.id === catId ? { ...c, items: c.items.map((i) => i.id === itemId ? { ...i, name } : i) } : c
    ));
  }, [update]);

  const moveItem = useCallback((fromCatId: string, itemId: string, toCatId: string) => {
    update((prev) => {
      const item = prev.find((c) => c.id === fromCatId)?.items.find((i) => i.id === itemId);
      if (!item) return prev;
      return prev.map((c) => {
        if (c.id === fromCatId) return { ...c, items: c.items.filter((i) => i.id !== itemId) };
        if (c.id === toCatId) return { ...c, items: [...c.items, item] };
        return c;
      });
    });
  }, [update]);

  return { categories, loading, error, addCategory, deleteCategory, renameCategory, addItem, deleteItem, renameItem, moveItem };
}
