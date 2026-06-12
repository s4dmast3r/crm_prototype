import type { ReactNode } from 'react'

const toneClass = {
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  teal: 'bg-teal-50 text-teal-800 ring-teal-200',
  blue: 'bg-sky-50 text-sky-800 ring-sky-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  red: 'bg-rose-50 text-rose-800 ring-rose-200',
  green: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
} as const

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: keyof typeof toneClass }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${toneClass[tone]}`}>
      {children}
    </span>
  )
}
