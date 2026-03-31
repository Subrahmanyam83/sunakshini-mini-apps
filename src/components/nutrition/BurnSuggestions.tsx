"use client";

import { FamilyMember, calcTDEE, calcBurnOptions, BurnOption } from "@/lib/use-nutrition";

type Props = {
  consumed: number;
  member: FamilyMember;
};

function formatDuration(h: number, m: number) {
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

function BurnRow({ label, options }: { label: string; options: BurnOption[] }) {
  const icons: Record<string, string> = {
    Walking: "🚶",
    "Home exercises": "🏠",
    "Gym workout": "🏋️",
  };
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => (
          <div key={opt.label} className="bg-white rounded-xl p-2.5 border border-gray-100 text-center">
            <div className="text-lg mb-1">{icons[opt.label]}</div>
            <p className="text-xs font-semibold text-gray-800">{formatDuration(opt.hours, opt.minutes)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{opt.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BurnSuggestions({ consumed, member }: Props) {
  const tdee = calcTDEE(member);
  const excess = consumed - tdee;
  const toMaintenanceBurn = excess > 0 ? excess : 0;
  // "burn more than consumed" = burn all consumed + 200 extra
  const toBurnAll = consumed + 200;

  return (
    <div className="space-y-4">
      {/* TDEE summary */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div>
          <p className="text-xs text-gray-400">Daily calorie need</p>
          <p className="text-lg font-bold text-gray-800">{tdee} kcal</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Consumed today</p>
          <p
            className="text-lg font-bold"
            style={{ color: consumed > tdee ? "#dc2626" : "#16a34a" }}
          >
            {consumed} kcal
          </p>
        </div>
      </div>

      {consumed === 0 ? (
        <p className="text-sm text-gray-400 text-center py-2">Log some food to see burn suggestions.</p>
      ) : excess <= 0 ? (
        <div className="bg-[#f0fdf4] rounded-2xl p-4 border border-[#bbf7d0] text-center">
          <p className="text-2xl mb-1">✓</p>
          <p className="text-sm font-semibold text-green-700">You&apos;re within your daily goal!</p>
          <p className="text-xs text-green-600 mt-1">
            {Math.abs(excess)} kcal under your TDEE — no extra burn needed.
          </p>
        </div>
      ) : (
        <BurnRow
          label={`To cancel today's excess (${toMaintenanceBurn} kcal)`}
          options={calcBurnOptions(toMaintenanceBurn, member.weightKg)}
        />
      )}

      {consumed > 0 && (
        <BurnRow
          label={`To burn more than consumed (${toBurnAll} kcal)`}
          options={calcBurnOptions(toBurnAll, member.weightKg)}
        />
      )}
    </div>
  );
}
