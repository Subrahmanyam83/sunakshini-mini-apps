"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartDataPoint } from "@/lib/alcohol-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  data: ChartDataPoint[];
}

function formatDate(dateStr: string) {
  const [, month, day] = dateStr.split("-");
  return `${day}/${month}`;
}

export function ConsumptionChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consumption Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
            No data for selected range
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d) => ({ ...d, date: formatDate(d.date) }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Consumption Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} unit="ml" />
            <Tooltip
              formatter={(value, name) => [
                `${value} ml`,
                name === "totalMl" ? "Total Volume" : "Pure Alcohol",
              ]}
            />
            <Legend
              formatter={(value) =>
                value === "totalMl" ? "Total Volume (ml)" : "Pure Alcohol (ml)"
              }
            />
            <Bar dataKey="totalMl" fill="#93c5fd" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pureAlcohol" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
