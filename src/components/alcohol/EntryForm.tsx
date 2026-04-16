"use client";

import { useEffect, useState } from "react";
import { DrinkType, DrinkUnit } from "@/types/alcohol";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";

const DRINK_TYPES: { value: DrinkType; label: string; unit: DrinkUnit }[] = [
  { value: "beer",   label: "Beer",   unit: "300ml" },
  { value: "whisky", label: "Whisky", unit: "peg"   },
  { value: "scotch", label: "Scotch", unit: "peg"   },
  { value: "rum",    label: "Rum",    unit: "peg"   },
  { value: "vodka",  label: "Vodka",  unit: "peg"   },
  { value: "gin",    label: "Gin",    unit: "peg"   },
  { value: "wine",   label: "Wine",   unit: "300ml" },
  { value: "other",  label: "Other",  unit: "peg"   },
];

const BEER_ML_PRESETS = [300, 330, 500, 650];

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export function EntryForm({ onAdded }: { onAdded: () => void }) {
  const [date, setDate]         = useState("");
  const [type, setType]         = useState<DrinkType>("beer");
  const [quantity, setQuantity] = useState("1");
  const [beerMl, setBeerMl]     = useState<number>(330);
  const [customMlInput, setCustomMlInput] = useState("");
  const [loading, setLoading]   = useState(false);
  const [status, setStatus]     = useState<"idle" | "success" | "error">("idle");

  useEffect(() => { setDate(getToday()); }, []);

  const selected  = DRINK_TYPES.find((d) => d.value === type)!;
  const isBeer    = type === "beer";
  const unitSize  = isBeer ? beerMl : (selected.unit === "300ml" ? 300 : 30);
  const totalMl   = Math.round(parseFloat(quantity || "0") * unitSize);

  function selectBeerMl(ml: number) {
    setBeerMl(ml);
    setCustomMlInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseFloat(quantity);
    if (!date || isNaN(qty) || qty <= 0) return;

    setLoading(true);
    setStatus("idle");
    try {
      const body: Record<string, unknown> = { date, type, quantity: qty, unit: selected.unit };
      if (isBeer) body.customMl = beerMl;
      const res = await fetch("/api/alcohol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setQuantity("1");
      onAdded();
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <CollapsibleSection title="Log a Drink" defaultOpen={true}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400">Date</label>
            <input
              type="date" value={date} max={getToday()}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-all"
              style={{ fontSize: "16px" }}
            />
          </div>

          <div className="grid grid-cols-[1fr_80px] gap-2 items-start">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">Drink</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DrinkType)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-all"
                style={{ fontSize: "16px" }}
              >
                {DRINK_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">Qty</label>
              <input
                type="number" min="0.5" step="0.5" value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-all"
                style={{ fontSize: "16px" }}
              />
            </div>
          </div>

          {/* Beer ml picker */}
          {isBeer && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Size (ml per serving)</label>
              <div className="flex gap-1.5 flex-wrap">
                {BEER_ML_PRESETS.map((ml) => (
                  <button
                    key={ml} type="button"
                    onClick={() => selectBeerMl(ml)}
                    className="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
                    style={{
                      background: beerMl === ml && !customMlInput ? "#4f46e5" : "#f1f5f9",
                      color:      beerMl === ml && !customMlInput ? "#fff"    : "#64748b",
                      borderColor: beerMl === ml && !customMlInput ? "#4f46e5" : "#e2e8f0",
                    }}
                  >
                    {ml}
                  </button>
                ))}
                <input
                  type="number" min="1" placeholder="custom"
                  value={customMlInput}
                  onChange={(e) => {
                    setCustomMlInput(e.target.value);
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v > 0) setBeerMl(v);
                  }}
                  className="w-20 rounded-full border px-2.5 py-1 text-xs outline-none focus:border-indigo-400"
                  style={{
                    borderColor: customMlInput ? "#4f46e5" : "#e2e8f0",
                    background: customMlInput ? "#eef2ff" : "#f1f5f9",
                    color: "#374151",
                    fontSize: "16px",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {totalMl > 0 ? `≈ ${totalMl} ml total` : ""}
          </p>
          <div className="flex items-center gap-2">
            {status === "success" && <span className="text-xs text-emerald-600 font-medium">Saved</span>}
            {status === "error"   && <span className="text-xs text-red-500 font-medium">Failed</span>}
            <button
              type="submit" disabled={loading}
              className="px-4 py-1.5 text-xs font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 transition-all active:scale-95"
            >
              {loading ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </CollapsibleSection>
  );
}
