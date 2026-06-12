import type { LucideIcon } from 'lucide-react'

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'teal',
}: {
  label: string
  value: string | number
  detail: string
  icon: LucideIcon
  tone?: 'teal' | 'blue' | 'green' | 'amber'
}) {
  const colors = {
    teal: 'bg-teal-50 text-teal-700',
    blue: 'bg-sky-50 text-sky-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={`grid size-11 place-items-center rounded-lg ${colors[tone]}`}>
          <Icon size={21} />
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-600">{detail}</p>
    </article>
  )
}
