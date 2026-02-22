"use client"

import { Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const clients = [
  {
    name: "Construtora Horizonte",
    location: "Maringá/PR | 12 pedidos",
    value: "R$ 89.500,00",
  },
  {
    name: "MegaObras Ltda",
    location: "Londrina/PR | 8 pedidos",
    value: "R$ 67.200,00",
  },
  {
    name: "Decor Plus",
    location: "Curitiba/PR | 15 pedidos",
    value: "R$ 54.800,00",
  },
  {
    name: "Steel House",
    location: "Cascavel/PR | 6 pedidos",
    value: "R$ 48.300,00",
  },
  {
    name: "Reforma Express",
    location: "Maringá/PR | 9 pedidos",
    value: "R$ 41.200,00",
  },
]

export function TopClients() {
  return (
    <Card>
      <CardHeader className="h-8 px-4 py-0 border-b border-border/60 flex items-center">
        <CardTitle className="text-base font-medium flex items-center gap-2 h-8 leading-none">
          <Users className="h-4 w-4 text-foreground" />
          Principais Clientes
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="space-y-4">
          {clients.map((client, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{client.name}</p>
                  <p className="text-xs text-foreground">{client.location}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-foreground">{client.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}









