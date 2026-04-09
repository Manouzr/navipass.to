'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'

const MONTHS = [
  { value: '01', label: 'Janvier' },
  { value: '02', label: 'Février' },
  { value: '03', label: 'Mars' },
  { value: '04', label: 'Avril' },
  { value: '05', label: 'Mai' },
  { value: '06', label: 'Juin' },
  { value: '07', label: 'Juillet' },
  { value: '08', label: 'Août' },
  { value: '09', label: 'Septembre' },
  { value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' },
  { value: '12', label: 'Décembre' },
]

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 80 }, (_, i) => String(currentYear - 10 - i))

interface Props {
  value: string          // YYYY-MM-DD
  onChange: (value: string) => void
  error?: string
}

export function DateOfBirthInput({ value, onChange, error }: Props) {
  const parts = value ? value.split('-') : []
  const [selYear, setSelYear] = useState(parts[0] ?? '')
  const [selMonth, setSelMonth] = useState(parts[1] ?? '')
  const [selDay, setSelDay] = useState(parts[2] ?? '')

  function emit(d: string, m: string, y: string) {
    if (d && m && y) {
      onChange(`${y}-${m}-${d}`)
    } else {
      onChange('')
    }
  }

  const borderColor = error ? '#FCA5A5' : '#E5E7EB'

  const selectClass = (filled: boolean) =>
    `flex-1 h-full text-sm bg-transparent outline-none appearance-none cursor-pointer ${
      filled ? 'text-text-primary' : 'text-text-secondary/60'
    }`

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text-primary pl-1">
        Date de naissance
      </label>

      <div
        className="flex items-center gap-1 bg-white border rounded-[12px] px-3 h-[52px] transition-colors focus-within:border-[#4BAFD4]"
        style={{ borderColor }}
      >
        <Calendar size={16} className="text-text-secondary shrink-0 mr-1" />

        {/* Jour */}
        <select
          value={selDay}
          onChange={(e) => { setSelDay(e.target.value); emit(e.target.value, selMonth, selYear) }}
          className={selectClass(!!selDay)}
        >
          <option value="">Jour</option>
          {DAYS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <span className="text-text-secondary/30 text-sm select-none">/</span>

        {/* Mois */}
        <select
          value={selMonth}
          onChange={(e) => { setSelMonth(e.target.value); emit(selDay, e.target.value, selYear) }}
          className={selectClass(!!selMonth)}
        >
          <option value="">Mois</option>
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <span className="text-text-secondary/30 text-sm select-none">/</span>

        {/* Année */}
        <select
          value={selYear}
          onChange={(e) => { setSelYear(e.target.value); emit(selDay, selMonth, e.target.value) }}
          className={selectClass(!!selYear)}
        >
          <option value="">Année</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-xs text-red-500 pl-1">{error}</p>}
    </div>
  )
}
