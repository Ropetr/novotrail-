"use client"

import { Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const clients = [
  {
    initials: "CH",
    name: "Construtora Horizonte",
    location: "Maringá/PR | 12 pedidos",
    value: "R$ 89.500,00",
    color: "bg-emerald-500",
  },
  {
    initials: "ML",
    name: "MegaObras Ltda",
    location: "Londrina/PR | 8 pedidos",
    value: "R$ 67.200,00",
    color: "bg-blue-500",
  },
  {
    initials: "DP",
    name: "Decor Plus",
    location: "Curitiba/PR | 15 pedidos",
    value: "R$ 54.800,00",
    color: "bg-purple-500",
  },
  {
    initials: "SH",
    name: "Steel House",
    location: "Cascavel/PR | 6 pedidos",
    value: "R$ 48.300,00",
    color: "bg-amber-500",
  },
  {
    initials: "RE",
    name: "Reforma Express",
    location: "Maringá/PR | 9 pedidos",
    value: "R$ 41.200,00",
    color: "bg-rose-500",
  },
]

export function TopClients() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          Principais Clientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clients.map((client, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className={`${client.color} text-white text-xs`}>
                    {client.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{client.name}</p>
                  <p className="text-xs text-muted-foreground">{client.location}</p>
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
