"use client"

import { PieChart as PieChartIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const data = [
  { name: "Drywall", value: 38, color: "hsl(var(--chart-1))" },
  { name: "Steel Frame", value: 22, color: "hsl(var(--chart-2))" },
  { name: "Forros", value: 17, color: "hsl(var(--chart-3))" },
  { name: "Acessórios", value: 12, color: "hsl(var(--chart-4))" },
  { name: "Ferramentas", value: 9, color: "hsl(var(--chart-5))" },
  { name: "Outros", value: 4, color: "hsl(var(--chart-6))" },
]

export function CategoryChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          Vendas por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="50%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value}%`, "Participação"]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className="text-2xl font-bold text-foreground">847.520,00</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
      </CardContent>
    </Card>
  )
}
