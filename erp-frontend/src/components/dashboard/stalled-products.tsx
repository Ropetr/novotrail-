"use client"

import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const products = [
  {
    name: "Perfil Canaleta 40mm",
    days: 45,
    stock: "120 un | R$ 3.600,00 parado",
  },
  {
    name: "Cantoneira Perfurada 25mm",
    days: 38,
    stock: "85 un | R$ 1.275,00 parado",
  },
  {
    name: "Rebite Pop 4mm",
    days: 32,
    stock: "500 un | R$ 750,00 parado",
  },
  {
    name: "Fita Adesiva Alumínio",
    days: 28,
    stock: "45 un | R$ 675,00 parado",
  },
]

export function StalledProducts() {
  return (
    <Card>
      <CardHeader className="h-8 px-4 py-0 border-b border-border/60 flex items-center">
        <CardTitle className="text-base font-medium flex items-center gap-2 h-8 leading-none">
          <AlertTriangle className="h-4 w-4 text-foreground" />
          Produtos Parados
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="space-y-3">
          {products.map((product, index) => (
            <div key={index} className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{product.name}</p>
                  <span className="text-xs font-medium text-rose-500">{product.days} dias</span>
                </div>
                <p className="text-xs text-foreground">Estoque: {product.stock}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}






