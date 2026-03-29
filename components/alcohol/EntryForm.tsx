"use client";

import { useState } from "react";
import { DrinkType, DrinkUnit } from "@/types/alcohol";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DRINK_TYPES: { value: DrinkType; label: string; unit: DrinkUnit; unitLabel: string }[] = [
  { value: "beer", label: "Beer", unit: "300ml", unitLabel: "glasses (300ml each)" },
  { value: "whisky", label: "Whisky", unit: "peg", unitLabel: "pegs (30ml each)" },
  { value: "scotch", label: "Scotch", unit: "peg", unitLabel: "pegs (30ml each)" },
  { value: "rum", label: "Rum", unit: "peg", unitLabel: "pegs (30ml each)" },
  { value: "vodka", label: "Vodka", unit: "peg", unitLabel: "pegs (30ml each)" },
  { value: "gin", label: "Gin", unit: "peg", unitLabel: "pegs (30ml each)" },
  { value: "wine", label: "Wine", unit: "300ml", unitLabel: "glasses (300ml each)" },
  { value: "other", label: "Other", unit: "peg", unitLabel: "pegs (30ml each)" },
];

interface Props {
  onAdded: () => void;
}

export function EntryForm({ onAdded }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [type, setType] = useState<DrinkType>("beer");
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const selected = DRINK_TYPES.find((d) => d.value === type)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const qty = parseFloat(quantity);
    if (!date || !type || isNaN(qty) || qty <= 0) {
      setError("Please fill all fields with valid values.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/alcohol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, type, quantity: qty, unit: selected.unit }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSuccess(true);
      setQuantity("1");
      onAdded();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to save entry. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Log a Drink</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Drink Type</label>
              <Select value={type} onValueChange={(v) => setType(v as DrinkType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DRINK_TYPES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-gray-400 font-normal">({selected.unitLabel})</span>
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">Entry saved successfully!</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Saving..." : "Log Entry"}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
