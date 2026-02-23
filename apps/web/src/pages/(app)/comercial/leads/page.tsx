"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Lead {
  id: string
  name: string
  company: string
  email: string
  phone: string
  source: "whatsapp" | "instagram" | "facebook" | "website" | "indicacao" | "outro"
  status: "novo" | "contatado" | "qualificado" | "proposta" | "perdido"
  value: number
  assignedTo: string
  createdAt: string
}

const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Construtora Horizonte",
    company: "Horizonte Obras Ltda",
    email: "contato@horizonte.com",
    phone: "(44) 99999-1000",
    source: "whatsapp",
    status: "qualificado",
    value: 45000,
    assignedTo: "João Oliveira",
    createdAt: "2026-02-20",
  },
  {
    id: "2",
    name: "Rafael Mendes",
    company: "Mendes Reformas",
    email: "rafael@mendesreformas.com",
    phone: "(44) 98888-2000",
    source: "instagram",
    status: "novo",
    value: 12000,
    assignedTo: "Maria Santos",
    createdAt: "2026-02-22",
  },
  {
    id: "3",
    name: "Casa & Cia",
    company: "Casa & Cia Materiais",
    email: "compras@casaecia.com",
    phone: "(43) 97777-3000",
    source: "indicacao",
    status: "proposta",
    value: 78000,
    assignedTo: "João Oliveira",
    createdAt: "2026-02-15",
  },
  {
    id: "4",
    name: "Paulo Ferreira",
    company: "PF Construções",
    email: "paulo@pfconstrucoes.com",
    phone: "(44) 96666-4000",
    source: "website",
    status: "contatado",
    value: 23000,
    assignedTo: "Maria Santos",
    createdAt: "2026-02-21",
  },
]

const sourceLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  website: "Website",
  indicacao: "Indicação",
  outro: "Outro",
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  novo: { label: "Novo", variant: "default" },
  contatado: { label: "Contatado", variant: "secondary" },
  qualificado: { label: "Qualificado", variant: "outline" },
  proposta: { label: "Proposta Enviada", variant: "outline" },
  perdido: { label: "Perdido", variant: "destructive" },
}

export default function LeadsPage() {
  const [search, setSearch] = useState("")

  const filteredLeads = mockLeads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.company.toLowerCase().includes(search.toLowerCase())
  )

  const totalValue = mockLeads.reduce((sum, l) => sum + l.value, 0)

  return (
    <div className="space-y-4 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads & Oportunidades</h1>
          <p className="text-muted-foreground text-sm">
            {mockLeads.length} leads · R$ {totalValue.toLocaleString("pt-BR")} em oportunidades
          </p>
        </div>
        <Button size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar leads..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Leads List */}
      <div className="space-y-2">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{lead.name}</span>
                    <Badge variant={statusConfig[lead.status].variant}>
                      {statusConfig[lead.status].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{lead.company}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{lead.email}</span>
                    <span>{lead.phone}</span>
                    <span>Via {sourceLabels[lead.source]}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    R$ {lead.value.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-xs text-muted-foreground">{lead.assignedTo}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
