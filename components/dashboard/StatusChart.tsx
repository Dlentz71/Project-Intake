'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DataItem {
  status: string
  label: string
  count: number
  color: string
}

interface Props {
  data: DataItem[]
}

export function StatusChart({ data }: Props) {
  const filtered = data.filter((d) => d.count > 0)
  if (filtered.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={filtered}
          dataKey="count"
          nameKey="label"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
        >
          {filtered.map((entry) => (
            <Cell key={entry.status} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
