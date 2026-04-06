'use client'

import { useRef } from 'react'
import { Calendar } from 'lucide-react'

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

interface Props {
  value: string          // YYYY-MM-DD
  onChange: (value: string) => void
  error?: string
}

function parse(val: string) {
  if (!val) return { day: '', month: '', year: '' }
  const [y, m, d] = val.split('-')
  return { day: d ?? '', month: m ?? '', year: y ?? '' }
}

function build(day: string, month: string, year: string): string {
  if (!day || !month || !year || year.length < 4) return ''
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export function DateOfBirthInput({ value, onChange, error }: Props) {
  const { day, month, year } = parse(value)

  const monthRef = useRef<HTMLSelectElement>(null)
  const yearRef = useRef<HTMLInputElement>(null)

  function handleDay(v: string) {
    const cleaned = v.replace(/\D/g, '').slice(0, 2)
    onChange(build(cleaned, month, year))
    if (cleaned.length === 2) monthRef.current?.focus()
  }

  function handleMonth(v: string) {
    onChange(build(day, v, year))
    if (v) yearRef.current?.focus()
  }

  function handleYear(v: string) {
    const cleaned = v.replace(/\D/g, '').slice(0, 4)
    onChange(build(day, month, cleaned))
  }

  const borderColor = error ? '#FCA5A5' : '#E5E7EB'
  const focusStyle = error ? 'focus:border-red-400' : 'focus:border-[#4BAFD4]'

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text-primary pl-1">
        Date de naissance
      </label>

      <div
        className="flex items-center gap-2 bg-white border rounded-[12px] px-4 h-[52px] transition-colors"
        style={{ borderColor }}
      >
        <Calendar size={16} className="text-text-secondary shrink-0" />

        {/* Jour */}
        <input
          type="text"
          inputMode="numeric"
          placeholder="JJ"
          value={day}
          onChange={(e) => handleDay(e.target.value)}
          className={`w-8 text-sm text-center text-text-primary bg-transparent outline-none border-b-2 border-transparent transition-colors ${focusStyle} placeholder:text-text-secondary/50`}
          maxLength={2}
        />

        <span className="text-text-secondary/40 text-sm select-none">/</span>

        {/* Mois */}
        <select
          ref={monthRef}
          value={month}
          onChange={(e) => handleMonth(e.target.value)}
          className={`text-sm text-text-primary bg-transparent outline-none border-b-2 border-transparent transition-colors ${focusStyle} ${!month ? 'text-text-secondary/50' : ''}`}
          style={{ appearance: 'none', WebkitAppearance: 'none' }}
        >
          <option value="" disabled>Mois</option>
          {MONTHS.map((m, i) => (
            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{m}</option>
          ))}
        </select>

        <span className="text-text-secondary/40 text-sm select-none">/</span>

        {/* Année */}
        <input
          ref={yearRef}
          type="text"
          inputMode="numeric"
          placeholder="AAAA"
          value={year}
          onChange={(e) => handleYear(e.target.value)}
          className={`w-12 text-sm text-center text-text-primary bg-transparent outline-none border-b-2 border-transparent transition-colors ${focusStyle} placeholder:text-text-secondary/50`}
          maxLength={4}
        />
      </div>

      {error && <p className="text-xs text-red-500 pl-1">{error}</p>}
    </div>
  )
}
