"use client"

import { Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const products = [
  {
    position: 1,
    name: "Placa Drywall ST 12.5mm",
    units: "2.450 unidades",
    value: "R$ 98.000,00",
  },
  {
    position: 2,
    name: "Perfil Montante 70mm",
    units: "1.820 unidades",
    value: "R$ 54.600,00",
  },
  {
    position: 3,
    name: "Massa para Drywall 28kg",
    units: "1.650 unidades",
    value: "R$ 41.250,00",
  },
  {
    position: 4,
    name: "Parafuso Drywall 25mm",
    units: "3.200 unidades",
    value: "R$ 38.400,00",
  },
  {
    position: 5,
    name: "Fita Telada 50m",
    units: "980 unidades",
    value: "R$ 29.400,00",
  },
]

export function TopProducts() {
  return (
    <Card>
      <CardHeader className="h-8 px-4 py-0 border-b border-border/60 flex items-center">
        <CardTitle className="text-base font-medium flex items-center gap-2 h-8 leading-none">
          <Package className="h-4 w-4 text-foreground" />
          Top Produtos
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.position} className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <span className="text-sm font-bold text-primary">{product.position}.</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-foreground">{product.units}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-foreground">{product.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}






