"use client"

import { Trophy, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const sellers = [
  {
    position: 1,
    initials: "CS",
    name: "Carlos Silva",
    value: "R$ 156.780,00",
    meta: 105,
    trend: "up",
    trendValue: 1,
    color: "bg-amber-500",
  },
  {
    position: 2,
    initials: "MS",
    name: "Maria Santos",
    value: "R$ 142.350,00",
    meta: 95,
    trend: "up",
    trendValue: 1,
    color: "bg-emerald-500",
  },
  {
    position: 3,
    initials: "JO",
    name: "João Oliveira",
    value: "R$ 138.900,00",
    meta: 93,
    trend: "down",
    trendValue: 1,
    color: "bg-blue-500",
  },
  {
    position: 4,
    initials: "AC",
    name: "Ana Costa",
    value: "R$ 125.400,00",
    meta: 84,
    trend: "up",
    trendValue: 2,
    color: "bg-purple-500",
  },
]

export function SellersRanking() {
  return (
    <Card>
      <CardHeader className="h-8 px-4 py-0 border-b border-border/60 flex items-center">
        <CardTitle className="text-base font-medium flex items-center gap-2 h-8 leading-none">
          <Trophy className="h-4 w-4 text-foreground" />
          Ranking Vendedores
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="space-y-4">
          {sellers.map((seller) => (
            <div key={seller.position} className="flex items-center gap-2">
              <div className="flex items-center gap-2 w-8">
                {seller.position <= 3 ? (
                  <Trophy
                    className={`h-4 w-4 ${
                      seller.position === 1
                        ? "text-amber-500"
                        : seller.position === 2
                        ? "text-foreground"
                        : "text-amber-700"
                    }`}
                  />
                ) : (
                  <span className="text-sm font-medium text-foreground">
                    {seller.position}º
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate">{seller.name}</p>
                  <div className="flex items-center gap-2">
                    {seller.trend === "up" ? (
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                    )}
                    <span
                      className={`text-xs ${
                        seller.trend === "up" ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {seller.trendValue}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-foreground">{seller.value}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress
                    value={seller.meta}
                    className={`h-1.5 flex-1 ${
                      seller.meta >= 100
                        ? "[&>div]:bg-emerald-500"
                        : seller.meta >= 90
                        ? "[&>div]:bg-amber-500"
                        : "[&>div]:bg-rose-500"
                    }`}
                  />
                  <span className="text-xs text-foreground w-16">
                    {seller.meta}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}












