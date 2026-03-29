"use client";

import { useCallback, useEffect, useState } from "react";
import { EntryForm } from "./EntryForm";
import { HealthIndicator } from "./HealthIndicator";
import { ConsumptionChart } from "./ConsumptionChart";
import { AlcoholEntry, AnalysisResult } from "@/types/alcohol";
import { ChartDataPoint } from "@/lib/alcohol-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ApiResponse {
  entries: AlcoholEntry[];
  analysis: AnalysisResult;
  chartData: ChartDataPoint[];
  allEntries: AlcoholEntry[];
}

const DRINK_LABELS: Record<string, string> = {
  beer: "Beer", whisky: "Whisky", scotch: "Scotch", rum: "Rum",
  vodka: "Vodka", gin: "Gin", wine: "Wine", other: "Other",
};

export function AlcoholTracker() {
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [from, setFrom] = useState(thirtyDaysAgo);
  const [to, setTo] = useState(today);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/alcohol?from=${from}&to=${to}`);
      if (!res.ok) throw new Error("Failed to load");
      const json: ApiResponse = await res.json();
      setData(json);
    } catch {
      setError("Failed to load data. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* Entry Form */}
      <EntryForm onAdded={fetchData} />

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Analysis Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                type="date"
                value={from}
                max={to}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="date"
                value={to}
                min={from}
                max={today}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              {[
                { label: "Last 7d", days: 7 },
                { label: "Last 30d", days: 30 },
                { label: "Last 90d", days: 90 },
                { label: "All time", days: 3650 },
              ].map(({ label, days }) => (
                <button
                  key={label}
                  onClick={() => {
                    setFrom(new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
                    setTo(today);
                  }}
                  className="px-3 py-2 text-xs font-medium rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12 text-gray-400 text-sm">Loading...</div>
      ) : data ? (
        <>
          {/* Health Indicator */}
          <HealthIndicator analysis={data.analysis} />

          {/* Chart */}
          <ConsumptionChart data={data.chartData} />

          {/* Entry Log */}
          {data.entries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Entry Log <span className="text-gray-400 font-normal text-sm">({data.entries.length} entries)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="pb-2 pr-4">Date</th>
                        <th className="pb-2 pr-4">Type</th>
                        <th className="pb-2 pr-4">Quantity</th>
                        <th className="pb-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...data.entries].reverse().map((e) => (
                        <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 pr-4 text-gray-600">{e.date}</td>
                          <td className="py-2 pr-4 font-medium">{DRINK_LABELS[e.type] ?? e.type}</td>
                          <td className="py-2 pr-4 text-gray-600">
                            {e.quantity} {e.unit === "peg" ? `peg${e.quantity !== 1 ? "s" : ""}` : "glass"}
                          </td>
                          <td className="py-2 text-gray-600">{e.totalMl} ml</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
