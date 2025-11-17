"use client";
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { ExpenseMedian } from "../data/prefectureData";

type ExpenseChartItem = {
  key?: keyof ExpenseMedian | null;
  label?: string | null;
  value?: number | string | null;
};

const FALLBACK_LABELS: Record<keyof ExpenseMedian, string> = {
  food: "食費",
  utilities: "光熱費",
  dailyGoods: "日用品",
  rent: "家賃",
  transport: "交通費",
  subscription: "サブスク",
  entertainment: "娯楽費（趣味娯楽）",
  medicalInsurance: "医療・保険",
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const name = item?.name ?? "";
  const value = Number(item?.value ?? 0);
  return (
    <div className="bg-white px-3 py-2 text-sm rounded border shadow">
      <p className="font-medium">{name}</p>
      <p>{value.toLocaleString()}円</p>
    </div>
  );
};

type Props = {
  items: ExpenseChartItem[];
};

export default function ExpenseChart({ items }: Props) {
  const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"];

  const data = items.map((item, index) => {
    const fallbackName =
      item.key != null ? FALLBACK_LABELS[item.key] : `項目${index + 1}`;
    return {
      name: item.label?.trim() || fallbackName,
      value: Number(item.value) || 0,
    };
  });

  return (
    <div>
      <h3 className="font-semibold mb-2">支出予想額の内訳</h3>
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
              isAnimationActive
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
