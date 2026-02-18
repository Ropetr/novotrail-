"use client"

import React from "react"

import { DollarSign, Receipt, ShoppingBag, TrendingUp, ArrowUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface KPICardProps {
  title: string
  value: string
  change: string
  changeValue: string
  goal: string
  progress: number
  icon: React.ElementType
}

function KPICard({ title, value, change, changeValue, goal, progress, icon: Icon }: KPICardProps) {
  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center text-xs text-emerald-600">
            <ArrowUp className="h-3 w-3" />
            {change}
          </span>
          <span className="text-xs text-muted-foreground">vs {changeValue}</span>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Meta: {goal}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-muted [&>div]:bg-emerald-500" />
        </div>
      </CardContent>
    </Card>
  )
}

export function KPICards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Faturamento"
        value="R$ 847.520,00"
        change="+17,1%"
        changeValue="R$ 723.450,00"
        goal="R$ 900.000,00"
        progress={94}
        icon={DollarSign}
      />
      <KPICard
        title="Ticket Médio"
        value="R$ 2.847,50"
        change="+7,5%"
        changeValue="R$ 2.650,00"
        goal="R$ 3.000,00"
        progress={95}
        icon={Receipt}
      />
      <KPICard
        title="Qtd. Vendas"
        value="298"
        change="+9,2%"
        changeValue="273"
        goal="300"
        progress={99}
        icon={ShoppingBag}
      />
      <KPICard
        title="Taxa Conversão"
        value="68,5%"
        change="+10,0%"
        changeValue="62,3%"
        goal="75,0%"
        progress={91}
        icon={TrendingUp}
      />
    </div>
  )
}
