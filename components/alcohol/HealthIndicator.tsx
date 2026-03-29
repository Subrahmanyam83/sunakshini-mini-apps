"use client";

import { AnalysisResult, HealthLevel } from "@/types/alcohol";

const CONFIG: Record<HealthLevel, { label: string; color: string; bg: string; description: string }> = {
  low: {
    label: "LOW",
    color: "text-green-700",
    bg: "bg-green-100 border-green-300",
    description: "Within safe limits. Keep it up!",
  },
  medium: {
    label: "MEDIUM",
    color: "text-amber-700",
    bg: "bg-amber-100 border-amber-300",
    description: "Moderate intake. Consider reducing.",
  },
  heavy: {
    label: "HEAVY",
    color: "text-red-700",
    bg: "bg-red-100 border-red-300",
    description: "High risk. Strongly consider cutting back.",
  },
};

export function HealthIndicator({ analysis }: { analysis: AnalysisResult }) {
  const cfg = CONFIG[analysis.level];

  return (
    <div className={`rounded-xl border-2 p-5 ${cfg.bg}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className={`text-3xl font-black tracking-wider ${cfg.color}`}>{cfg.label}</span>
        <span className="text-sm text-gray-500 font-medium">consumption level</span>
      </div>
      <p className={`text-sm font-medium ${cfg.color}`}>{cfg.description}</p>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-600">
        <div>
          <span className="block text-xs uppercase tracking-wide text-gray-400">Weekly avg (pure alcohol)</span>
          <span className="font-semibold">{analysis.weeklyAvgPureAlcohol} ml</span>
        </div>
        <div>
          <span className="block text-xs uppercase tracking-wide text-gray-400">Weekly avg (total)</span>
          <span className="font-semibold">{analysis.weeklyAvgTotalMl} ml</span>
        </div>
        <div>
          <span className="block text-xs uppercase tracking-wide text-gray-400">Entries in range</span>
          <span className="font-semibold">{analysis.totalEntries}</span>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-400">
        Based on WHO guidelines: &lt;100ml/week pure alcohol = Low, 100–200ml = Medium, &gt;200ml = Heavy
      </p>
    </div>
  );
}
