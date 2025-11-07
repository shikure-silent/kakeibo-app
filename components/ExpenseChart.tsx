'use client'
import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ExpenseMedian } from '../data/prefectureData'

export default function ExpenseChart({ expense }: { expense: ExpenseMedian }) {
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#3B82F6']
  const data = [
    { name: '食費', value: expense.food },
    { name: '光熱費', value: expense.utilities },
    { name: '日用品', value: expense.dailyGoods },
    { name: '家賃', value: expense.rent },
    { name: '交通費', value: expense.transport },
  ]
  return (
    <div>
      <h3 className="font-semibold mb-2">支出内訳</h3>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} isAnimationActive>
              {data.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value.toLocaleString()}円`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
