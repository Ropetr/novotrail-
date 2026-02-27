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
} from "recharts"

const data = [
  { name: "Jan", esteAno: 120000, anoAnterior: 95000 },
  { name: "Fev", esteAno: 135000, anoAnterior: 110000 },
  { name: "Mar", esteAno: 180000, anoAnterior: 125000 },
  { name: "Abr", esteAno: 165000, anoAnterior: 140000 },
  { name: "Mai", esteAno: 145000, anoAnterior: 130000 },
  { name: "Jun", esteAno: 102520, anoAnterior: 123450 },
]

export function SalesChart() {
  return (
    <Card>
      <CardHeader className="h-8 px-4 py-0 border-b border-border/60 flex items-center justify-between">
        <CardTitle className="text-base font-medium flex items-center gap-2 h-8 leading-none">
          <BarChart3 className="h-4 w-4 text-foreground" />
          Evolucao de Vendas
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 pb-0">
        <ResponsiveContainer width="100%" height={310}>
          <BarChart data={data} barGap={4} margin={{ left: -20, right: 8, top: 0, bottom: 0 }}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number, _name: string, props: { color?: string }) => {
                const formatted = new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(value)
                const color = props?.color || "hsl(var(--foreground))"
                return [<span style={{ color }}>{formatted}</span>, _name]
              }}
            />
            <Bar
              dataKey="esteAno"
              name="Este ano"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="anoAnterior"
              name="Ano anterior"
              fill="hsl(var(--muted-foreground))"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 h-8 border-t border-border/60 flex items-center justify-end gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
            <span className="text-foreground">Este ano</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-muted-foreground" />
            <span className="text-foreground">Ano anterior</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}





