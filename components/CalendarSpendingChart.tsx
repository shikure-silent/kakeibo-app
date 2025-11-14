"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

type Props = {
  data: { day: number; amount: number }[];
};

export default function CalendarSpendingChart({ data }: Props) {
  const tooltipFormatter = (value: ValueType): [ValueType, NameType] => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    const formatted =
      typeof normalizedValue === "number"
        ? `${normalizedValue.toLocaleString()}円`
        : `${normalizedValue ?? ""}`;

    return [formatted as ValueType, "支出額"];
  };

  return (
    <div>
      <h2 className="font-semibold mb-2">日別支出グラフ</h2>
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip<ValueType, NameType>
              formatter={tooltipFormatter}
              labelFormatter={(label) => `${label}日`}
            />
            <Bar dataKey="amount" name="支出額" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
