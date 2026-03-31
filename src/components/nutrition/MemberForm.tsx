"use client";

import { useState } from "react";
import { FamilyMember, ActivityLevel } from "@/lib/use-nutrition";

type Props = {
  initial?: FamilyMember;
  onSave: (m: Omit<FamilyMember, "id"> & { id?: string }) => Promise<void>;
  onCancel: () => void;
};

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: "sedentary", label: "Sedentary", desc: "Little or no exercise" },
  { value: "lightly_active", label: "Lightly active", desc: "Exercise 1–3 days/week" },
  { value: "moderately_active", label: "Moderately active", desc: "Exercise 3–5 days/week" },
  { value: "very_active", label: "Very active", desc: "Hard exercise 6–7 days/week" },
];

export function MemberForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [age, setAge] = useState(String(initial?.age ?? ""));
  const [gender, setGender] = useState<"male" | "female">(initial?.gender ?? "male");
  const [weightKg, setWeightKg] = useState(String(initial?.weightKg ?? ""));
  const [heightCm, setHeightCm] = useState(String(initial?.heightCm ?? ""));
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    initial?.activityLevel ?? "lightly_active"
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !age || !weightKg || !heightCm) {
      setErr("Please fill in all fields.");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      await onSave({
        ...(initial?.id ? { id: initial.id } : {}),
        name: name.trim(),
        age: Number(age),
        gender,
        weightKg: Number(weightKg),
        heightCm: Number(heightCm),
        activityLevel,
      });
    } catch {
      setErr("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sunakshini"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:bg-white transition-all"
          style={{ fontSize: "16px" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="30"
            min="1"
            max="120"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:bg-white transition-all"
            style={{ fontSize: "16px" }}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as "male" | "female")}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:bg-white transition-all"
            style={{ fontSize: "16px" }}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Weight (kg)</label>
          <input
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            placeholder="65"
            min="1"
            step="0.1"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:bg-white transition-all"
            style={{ fontSize: "16px" }}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Height (cm)</label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            placeholder="165"
            min="50"
            step="1"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:bg-white transition-all"
            style={{ fontSize: "16px" }}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 block mb-2">Activity Level</label>
        <div className="space-y-2">
          {ACTIVITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setActivityLevel(opt.value)}
              className="w-full text-left px-3 py-2.5 rounded-xl border transition-all active:scale-[0.98]"
              style={
                activityLevel === opt.value
                  ? { borderColor: "#16a34a", background: "#f0fdf4" }
                  : { borderColor: "#e5e7eb", background: "#f9fafb" }
              }
            >
              <span className="text-sm font-medium text-gray-800">{opt.label}</span>
              <span className="text-xs text-gray-400 ml-2">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {err && <p className="text-xs text-red-500">{err}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 h-11 rounded-xl text-sm font-semibold text-white disabled:opacity-50 active:scale-95 transition-all"
          style={{ background: "#16a34a" }}
        >
          {saving ? "Saving…" : initial ? "Update" : "Add Member"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-11 px-4 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 active:scale-95 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
