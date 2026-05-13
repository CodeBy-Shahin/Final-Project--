"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DemandForecastItem } from "@/types/domain";

export function DemandForecastChart({ items }: { items: DemandForecastItem[] }) {
  const chartData = items.slice(0, 6).map((item) => ({
    name: item.name.length > 18 ? `${item.name.slice(0, 18)}...` : item.name,
    recent: item.recentSold,
    predicted: item.predictedUnits,
  }));

  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 12, right: 16, left: 0, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} height={78} tickMargin={12} />
          <YAxis allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "rgb(248 86 6 / 0.08)" }}
            formatter={(value, name) => [
              `${Number(value ?? 0)} units`,
              name === "recent" ? "Recent sales" : "Predicted sales",
            ]}
          />
          <Legend />
          <Bar dataKey="recent" name="Recent sales" fill="#159a54" radius={[4, 4, 0, 0]} />
          <Bar dataKey="predicted" name="Predicted sales" fill="#f85606" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
