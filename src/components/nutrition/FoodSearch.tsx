"use client";

import { useState, useCallback, useRef } from "react";
import { FoodItem } from "@/lib/use-nutrition";

type UsdaResult = {
  fdcId: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
};

type Props = {
  onAdd: (food: FoodItem) => void;
};

export function FoodSearch({ onAdd }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UsdaResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState("");
  const [selected, setSelected] = useState<UsdaResult | null>(null);
  const [portionGrams, setPortionGrams] = useState("100");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    setSearchErr("");
    try {
      const res = await fetch(`/api/food-search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setResults(json.foods ?? []);
    } catch {
      setSearchErr("Search failed. Try again.");
    } finally {
      setSearching(false);
    }
  }, []);

  function handleQueryChange(val: string) {
    setQuery(val);
    setSelected(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 500);
  }

  function selectFood(food: UsdaResult) {
    setSelected(food);
    setPortionGrams("100");
    setResults([]);
    setQuery(food.name);
  }

  function handleAdd() {
    if (!selected) return;
    const grams = Number(portionGrams);
    if (!grams || grams < 1) return;
    const factor = grams / 100;
    onAdd({
      fdcId: selected.fdcId,
      name: selected.name,
      portionGrams: grams,
      calories: Math.round(selected.caloriesPer100g * factor),
      proteinG: Math.round(selected.proteinPer100g * factor * 10) / 10,
      carbsG: Math.round(selected.carbsPer100g * factor * 10) / 10,
      fatG: Math.round(selected.fatPer100g * factor * 10) / 10,
    });
    setQuery("");
    setSelected(null);
    setPortionGrams("100");
    setResults([]);
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search food (e.g. rice, chicken, dal)…"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:bg-white transition-all"
          style={{ fontSize: "16px" }}
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-[#16a34a] animate-spin" />
          </div>
        )}
      </div>

      {searchErr && <p className="text-xs text-red-500">{searchErr}</p>}

      {results.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50 max-h-52 overflow-y-auto">
          {results.map((food) => (
            <button
              key={food.fdcId}
              type="button"
              onClick={() => selectFood(food)}
              className="w-full text-left px-3 py-2.5 active:bg-gray-50 transition-colors"
            >
              <p className="text-sm text-gray-800 leading-snug">{food.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {Math.round(food.caloriesPer100g)} kcal · {Math.round(food.proteinPer100g)}g protein per 100g
              </p>
            </button>
          ))}
        </div>
      )}

      {results.length === 0 && query.length >= 2 && !searching && !selected && (
        <p className="text-xs text-gray-400 text-center py-2">No results. Try a different name.</p>
      )}

      {selected && (
        <div className="bg-[#f0fdf4] rounded-xl p-3 space-y-3 border border-[#bbf7d0]">
          <p className="text-sm font-medium text-gray-800 leading-snug">{selected.name}</p>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 flex-shrink-0">Portion (g)</label>
            <input
              type="number"
              value={portionGrams}
              onChange={(e) => setPortionGrams(e.target.value)}
              min="1"
              className="w-24 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#16a34a] transition-all"
              style={{ fontSize: "16px" }}
            />
            <span className="text-xs text-gray-400">
              = {Math.round(selected.caloriesPer100g * Number(portionGrams || 0) / 100)} kcal
            </span>
          </div>
          <div className="flex gap-3 text-xs text-gray-500">
            <span>Protein: {Math.round(selected.proteinPer100g * Number(portionGrams || 0) / 100 * 10) / 10}g</span>
            <span>Carbs: {Math.round(selected.carbsPer100g * Number(portionGrams || 0) / 100 * 10) / 10}g</span>
            <span>Fat: {Math.round(selected.fatPer100g * Number(portionGrams || 0) / 100 * 10) / 10}g</span>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!portionGrams || Number(portionGrams) < 1}
            className="w-full h-10 rounded-xl text-sm font-semibold text-white disabled:opacity-40 active:scale-95 transition-all"
            style={{ background: "#16a34a" }}
          >
            Add to Meal
          </button>
        </div>
      )}
    </div>
  );
}
