'use client'
import React from 'react'
import { prefectureData } from '../data/prefectureData'

export default function PrefectureSelector({ selectedPref, onChange }: { selectedPref: string; onChange: (p: string) => void }) {
  const prefectures = Object.keys(prefectureData)
  return (
    <div>
      <label className="block font-medium mb-1">都道府県</label>
      <select value={selectedPref} onChange={(e) => onChange(e.target.value)} className="w-full border rounded p-2">
        {prefectures.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
    </div>
  )
}
