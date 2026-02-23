"use client"

import { BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts"

const data = [
  { name: "Drywall", value: 38, color: "hsl(var(--chart-1))" },
  { name: "Steel Frame", value: 22, color: "hsl(var(--chart-2))" },
  { name: "Forros", value: 17, color: "hsl(var(--chart-3))" },
  { name: "Acessorios", value: 12, color: "hsl(var(--chart-4))" },
  { name: "Ferramentas", value: 9, color: "hsl(var(--chart-5))" },
  { name: "Outros", value: 4, color: "hsl(var(--chart-6))" },
]

export function CategoryChart() {
  return (
    <Card>
      <CardHeader className="h-8 px-4 py-0 border-b border-border/60 flex items-center">
        <CardTitle className="text-base font-medium flex items-center gap-2 h-8 leading-none">
          <BarChart3 className="h-4 w-4 text-foreground" />
          Vendas por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data} barGap={4} margin={{ left: 8, right: 8, top: 0, bottom: 0 }}>
                <XAxis hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value}%`, "Participacao"]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="w-40 space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-foreground">
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}









