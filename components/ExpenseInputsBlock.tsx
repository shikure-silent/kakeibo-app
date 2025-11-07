'use client'
import React from 'react'
import { ExpenseMedian } from '../data/prefectureData'
import NumberInput from './NumberInput'

export default function ExpenseInputsBlock({ median, inputs, onChange }: { median: ExpenseMedian; inputs: Record<keyof ExpenseMedian, string>; onChange: (k: keyof ExpenseMedian, v: string) => void }) {
  const labels: Record<keyof ExpenseMedian, string> = { food: '食費', utilities: '光熱費', dailyGoods: '日用品', rent: '家賃', transport: '交通費' }
  return (
    <div>
      <h3 className="font-semibold mb-2">支出（中央値を初期表示。編集可）</h3>
      <div className="grid grid-cols-1 gap-3">
        {(Object.keys(labels) as (keyof ExpenseMedian)[]).map((k) => (
          <div key={k} className="bg-white p-3 rounded shadow-sm">
            <NumberInput label={`${labels[k]}（中央値: ${median[k].toLocaleString()}円）`} value={inputs[k]} onChange={(v) => onChange(k, v)} placeholder={String(median[k])} />
          </div>
        ))}
      </div>
    </div>
  )
}
