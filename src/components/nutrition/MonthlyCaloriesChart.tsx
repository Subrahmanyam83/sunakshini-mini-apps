"use client";

import { useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { DailyLog, FamilyMember, sumMealCalories, calcTDEE } from "@/lib/use-nutrition";

type Props = {
  members: FamilyMember[];
  logs: DailyLog[];
};

type ViewMode = "monthly" | "weekly";

// ── Month helpers ────────────────────────────────────────────────────────────

function getMonthOptions() {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      label: d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return options;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// ── Week helpers ─────────────────────────────────────────────────────────────

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toYMD(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getWeekData(
  memberId: string,
  logs: DailyLog[],
  weekCount: number
): { label: string; avgCalories: number; loggedDays: number }[] {
  const monday = getMondayOf(new Date());
  const weeks = [];

  for (let w = weekCount - 1; w >= 0; w--) {
    const start = new Date(monday);
    start.setDate(monday.getDate() - w * 7);

    const days: number[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(start);
      day.setDate(start.getDate() + d);
      const date = toYMD(day);
      const log = logs.find((l) => l.memberId === memberId && l.date === date);
      const cal = log ? sumMealCalories(log.meals) : 0;
      if (cal > 0) days.push(cal);
    }

    const avgCalories = days.length > 0 ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0;
    const label = start.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

    weeks.push({ label, avgCalories, loggedDays: days.length });
  }

  return weeks;
}

const WEEK_OPTIONS = [1, 2, 3, 4, 6, 8];

// ── Component ────────────────────────────────────────────────────────────────

export function MonthlyCaloriesChart({ members, logs }: Props) {
  const monthOptions = getMonthOptions();
  const [view, setView] = useState<ViewMode>("monthly");
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id ?? "");
  const [weekCount, setWeekCount] = useState(4);

  const { year, month } = monthOptions[selectedMonth];
  const member = members.find((m) => m.id === selectedMemberId);
  const tdee = member ? calcTDEE(member) : 0;

  // Monthly data
  const daysInMonth = getDaysInMonth(year, month);
  const monthData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const log = logs.find((l) => l.memberId === selectedMemberId && l.date === date);
    const calories = log ? sumMealCalories(log.meals) : 0;
    return { day, calories };
  });

  const todayDay = new Date().getDate();
  const isCurrentMonth = new Date().getFullYear() === year && new Date().getMonth() === month;

  // Weekly data
  const weekData = getWeekData(selectedMemberId, logs, weekCount);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      {/* Header + toggle */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Calories</p>
        <div className="flex rounded-lg overflow-hidden border border-gray-200 text-[11px] font-medium">
          <button
            onClick={() => setView("monthly")}
            className="px-3 py-1 transition-colors"
            style={{ background: view === "monthly" ? "#16a34a" : "white", color: view === "monthly" ? "white" : "#6b7280" }}
          >
            Monthly
          </button>
          <button
            onClick={() => setView("weekly")}
            className="px-3 py-1 transition-colors border-l border-gray-200"
            style={{ background: view === "weekly" ? "#16a34a" : "white", color: view === "weekly" ? "white" : "#6b7280" }}
          >
            Weekly avg
          </button>
        </div>
      </div>

      {/* Member selector */}
      {members.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMemberId(m.id)}
              className="flex-shrink-0 h-7 px-3 rounded-full text-xs font-medium transition-all"
              style={{
                background: selectedMemberId === m.id ? "#16a34a" : "#f0fdf4",
                color: selectedMemberId === m.id ? "white" : "#16a34a",
              }}
            >
              {m.name}
            </button>
          ))}
        </div>
      )}

      {/* Month selector / Week count selector */}
      {view === "monthly" ? (
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-green-400 bg-white text-gray-600"
        >
          {monthOptions.map((o, i) => (
            <option key={i} value={i}>{o.label}</option>
          ))}
        </select>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 flex-shrink-0">Show last</span>
          <div className="flex gap-1.5">
            {WEEK_OPTIONS.map((w) => (
              <button
                key={w}
                onClick={() => setWeekCount(w)}
                className="h-7 px-3 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: weekCount === w ? "#16a34a" : "#f0fdf4",
                  color: weekCount === w ? "white" : "#16a34a",
                }}
              >
                {w}w
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      {view === "monthly" ? (
        <ResponsiveContainer width="100%" height={160}>
          <ComposedChart data={monthData} barSize={6} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "#f0fdf4" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const cal = payload[0].value as number;
                return (
                  <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-md text-xs">
                    <p className="text-gray-500">Day {label}</p>
                    <p className="font-semibold text-gray-800">{cal} kcal</p>
                    {tdee > 0 && cal > 0 && (
                      <p style={{ color: cal > tdee ? "#dc2626" : "#16a34a" }}>
                        {cal > tdee ? `+${cal - tdee} over` : `${tdee - cal} under`} goal
                      </p>
                    )}
                  </div>
                );
              }}
            />
            {tdee > 0 ? (
              <Bar dataKey="calories" radius={[3, 3, 0, 0]}>
                {monthData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.calories === 0
                        ? "#e5e7eb"
                        : isCurrentMonth && entry.day > todayDay
                        ? "#e5e7eb"
                        : entry.calories > tdee
                        ? "#dc2626"
                        : "#16a34a"
                    }
                  />
                ))}
              </Bar>
            ) : (
              <Bar dataKey="calories" radius={[3, 3, 0, 0]} fill="#16a34a" />
            )}
            <Line dataKey="calories" type="monotone" dot={false} stroke="#6366f1" strokeWidth={1.5} strokeOpacity={0.6} connectNulls={false} />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={160}>
            <ComposedChart data={weekData} barSize={18} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "#f0fdf4" }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const avg = payload[0].value as number;
                  const entry = weekData.find((w) => w.label === label);
                  return (
                    <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-md text-xs space-y-0.5">
                      <p className="text-gray-500">Week of {label}</p>
                      <p className="font-semibold text-gray-800">{avg > 0 ? `${avg} kcal avg/day` : "No data"}</p>
                      {tdee > 0 && avg > 0 && (
                        <p style={{ color: avg > tdee ? "#dc2626" : "#16a34a" }}>
                          {avg > tdee ? `+${avg - tdee} over` : `${tdee - avg} under`} daily goal
                        </p>
                      )}
                      {entry && entry.loggedDays > 0 && (
                        <p className="text-gray-400">{entry.loggedDays} day{entry.loggedDays !== 1 ? "s" : ""} logged</p>
                      )}
                    </div>
                  );
                }}
              />
              <Bar dataKey="avgCalories" radius={[4, 4, 0, 0]}>
                {weekData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.avgCalories === 0
                        ? "#e5e7eb"
                        : tdee > 0 && entry.avgCalories > tdee
                        ? "#dc2626"
                        : "#16a34a"
                    }
                  />
                ))}
              </Bar>
              {tdee > 0 && (
                <Line dataKey="avgCalories" type="monotone" dot={false} stroke="#6366f1" strokeWidth={1.5} strokeOpacity={0.6} connectNulls={false} />
              )}
            </ComposedChart>
          </ResponsiveContainer>

          {/* Weekly summary row */}
          {weekData.some((w) => w.avgCalories > 0) && (
            <div className="grid grid-cols-3 gap-2 pt-1">
              {(() => {
                const logged = weekData.filter((w) => w.avgCalories > 0);
                const overallAvg = logged.length > 0 ? Math.round(logged.reduce((a, b) => a + b.avgCalories, 0) / logged.length) : 0;
                const goodWeeks = logged.filter((w) => w.avgCalories <= tdee).length;
                const badWeeks = logged.filter((w) => w.avgCalories > tdee).length;
                return (
                  <>
                    <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-gray-400">Overall avg</p>
                      <p className="text-sm font-semibold text-gray-700">{overallAvg > 0 ? `${overallAvg}` : "—"}</p>
                      <p className="text-[10px] text-gray-400">kcal/day</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-green-600">On track</p>
                      <p className="text-sm font-semibold text-green-700">{goodWeeks}</p>
                      <p className="text-[10px] text-green-600">week{goodWeeks !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-red-500">Over goal</p>
                      <p className="text-sm font-semibold text-red-600">{badWeeks}</p>
                      <p className="text-[10px] text-red-500">week{badWeeks !== 1 ? "s" : ""}</p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block bg-green-600" />Within goal</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block bg-red-600" />Over goal</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block bg-gray-200" />No data</span>
      </div>
    </div>
  );
}
