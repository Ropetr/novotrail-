"use client"

import { useState } from "react"
import { Settings, Calculator, FileText, AlertTriangle, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

const mockTaxSummary = {
  icmsTotal: 14576.00,
  issTotal: 445.00,
  pisTotal: 2845.00,
  cofinsTotal: 6580.00,
  irTotal: 3200.00,
  csllTotal: 1920.00,
}

const mockTaxRules = [
  { id: "1", ncm: "6809.11.00", description: "Placas de gesso acartonado", icms: 12, pis: 1.65, cofins: 7.6, ipi: 0, cst: "000", cfop: "5102", origin: "Nacional" },
  { id: "2", ncm: "7308.90.90", description: "Perfis de aço galvanizado", icms: 18, pis: 1.65, cofins: 7.6, ipi: 5, cst: "000", cfop: "5102", origin: "Nacional" },
  { id: "3", ncm: "3214.10.10", description: "Massa corrida (mástique)", icms: 12, pis: 1.65, cofins: 7.6, ipi: 0, cst: "000", cfop: "5102", origin: "Nacional" },
  { id: "4", ncm: "4811.41.90", description: "Fita de papel adesiva", icms: 18, pis: 1.65, cofins: 7.6, ipi: 0, cst: "000", cfop: "5102", origin: "Nacional" },
  { id: "5", ncm: "7318.15.00", description: "Parafusos e fixadores", icms: 18, pis: 1.65, cofins: 7.6, ipi: 8, cst: "000", cfop: "5102", origin: "Nacional" },
  { id: "6", ncm: "6809.19.00", description: "Cantoneiras e acessórios gesso", icms: 12, pis: 1.65, cofins: 7.6, ipi: 0, cst: "000", cfop: "5102", origin: "Nacional" },
]

const mockObligations = [
  { name: "SPED Fiscal (EFD ICMS/IPI)", period: "Fev/2026", deadline: "2026-03-15", status: "pending" as const },
  { name: "SPED Contribuições (PIS/COFINS)", period: "Fev/2026", deadline: "2026-03-15", status: "pending" as const },
  { name: "DCTF", period: "Fev/2026", deadline: "2026-03-20", status: "pending" as const },
  { name: "GIA (Guia Inf. e Apuração ICMS)", period: "Fev/2026", deadline: "2026-03-12", status: "pending" as const },
  { name: "SPED Fiscal (EFD ICMS/IPI)", period: "Jan/2026", deadline: "2026-02-15", status: "delivered" as const },
  { name: "SPED Contribuições (PIS/COFINS)", period: "Jan/2026", deadline: "2026-02-15", status: "delivered" as const },
]

const obligationStatus = {
  pending: { label: "Pendente", className: "text-amber-600 bg-amber-50" },
  delivered: { label: "Entregue", className: "text-green-600 bg-green-50" },
  late: { label: "Atrasada", className: "text-red-600 bg-red-50" },
}

export function TaxDashboard() {
  const [activeTab, setActiveTab] = useState("summary")

  const totalTaxes = Object.values(mockTaxSummary).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Impostos e Obrigações</h1>
        <Badge variant="outline" className="text-xs gap-1"><Calculator className="h-3 w-3" />Regime: Lucro Presumido</Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Total Impostos (mês)</p>
          <p className="text-lg font-bold text-foreground">{fmt(totalTaxes)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">ICMS a Recolher</p>
          <p className="text-lg font-bold text-blue-600">{fmt(mockTaxSummary.icmsTotal)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">PIS + COFINS</p>
          <p className="text-lg font-bold text-purple-600">{fmt(mockTaxSummary.pisTotal + mockTaxSummary.cofinsTotal)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" /><p className="text-xs text-muted-foreground">Obrigações Pendentes</p></div>
          <p className="text-lg font-bold text-amber-600 mt-1">{mockObligations.filter(o => o.status === "pending").length}</p>
        </CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="summary">Resumo Mensal</TabsTrigger>
          <TabsTrigger value="rules">Regras Fiscais (NCM)</TabsTrigger>
          <TabsTrigger value="obligations">Obrigações Acessórias</TabsTrigger>
        </TabsList>

        {/* Resumo */}
        <TabsContent value="summary">
          <Card><CardContent className="p-0">
            <table className="w-full"><thead><tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Imposto</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Base de Cálculo</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Alíquota</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Valor</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Vencimento</th>
            </tr></thead><tbody>
              {[
                { name: "ICMS", base: 121466.67, rate: "12%", value: mockTaxSummary.icmsTotal, due: "15/03/2026" },
                { name: "PIS", base: 172424.24, rate: "1,65%", value: mockTaxSummary.pisTotal, due: "25/03/2026" },
                { name: "COFINS", base: 86578.95, rate: "7,60%", value: mockTaxSummary.cofinsTotal, due: "25/03/2026" },
                { name: "IRPJ", base: 40000.00, rate: "8,00%", value: mockTaxSummary.irTotal, due: "30/03/2026" },
                { name: "CSLL", base: 21333.33, rate: "9,00%", value: mockTaxSummary.csllTotal, due: "30/03/2026" },
                { name: "ISS", base: 8900.00, rate: "5,00%", value: mockTaxSummary.issTotal, due: "10/03/2026" },
              ].map((tax, i) => (
                <tr key={tax.name} className={cn("border-b border-border", i % 2 === 0 ? "bg-card" : "bg-muted/10")}>
                  <td className="px-4 py-3"><span className="text-sm font-medium text-foreground">{tax.name}</span></td>
                  <td className="px-4 py-3 text-right"><span className="text-sm text-muted-foreground">{fmt(tax.base)}</span></td>
                  <td className="px-4 py-3 text-center"><span className="text-sm text-foreground">{tax.rate}</span></td>
                  <td className="px-4 py-3 text-right"><span className="text-sm font-medium text-foreground">{fmt(tax.value)}</span></td>
                  <td className="px-4 py-3"><span className="text-sm text-foreground">{tax.due}</span></td>
                </tr>
              ))}
              <tr className="bg-muted/30 font-medium">
                <td className="px-4 py-3" colSpan={3}><span className="text-sm font-semibold text-foreground">Total</span></td>
                <td className="px-4 py-3 text-right"><span className="text-sm font-bold text-foreground">{fmt(totalTaxes)}</span></td>
                <td></td>
              </tr>
            </tbody></table>
          </CardContent></Card>
        </TabsContent>

        {/* Regras NCM */}
        <TabsContent value="rules">
          <Card><CardContent className="p-0">
            <table className="w-full"><thead><tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">NCM</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Descrição</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">CST</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">CFOP</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">ICMS</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">PIS</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">COFINS</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">IPI</th>
            </tr></thead><tbody>
              {mockTaxRules.map((rule, i) => (
                <tr key={rule.id} className={cn("border-b border-border", i % 2 === 0 ? "bg-card" : "bg-muted/10")}>
                  <td className="px-4 py-3"><span className="text-sm font-mono text-foreground">{rule.ncm}</span></td>
                  <td className="px-4 py-3"><span className="text-sm text-foreground">{rule.description}</span></td>
                  <td className="px-4 py-3 text-center"><Badge variant="outline" className="text-xs font-mono">{rule.cst}</Badge></td>
                  <td className="px-4 py-3 text-center"><span className="text-sm font-mono text-foreground">{rule.cfop}</span></td>
                  <td className="px-4 py-3 text-center"><span className="text-sm text-foreground">{rule.icms}%</span></td>
                  <td className="px-4 py-3 text-center"><span className="text-sm text-muted-foreground">{rule.pis}%</span></td>
                  <td className="px-4 py-3 text-center"><span className="text-sm text-muted-foreground">{rule.cofins}%</span></td>
                  <td className="px-4 py-3 text-center"><span className="text-sm text-muted-foreground">{rule.ipi}%</span></td>
                </tr>
              ))}
            </tbody></table>
          </CardContent></Card>
        </TabsContent>

        {/* Obrigações */}
        <TabsContent value="obligations">
          <Card><CardContent className="p-0">
            <table className="w-full"><thead><tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Obrigação</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Competência</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Prazo</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Status</th>
            </tr></thead><tbody>
              {mockObligations.map((ob, i) => {
                const st = obligationStatus[ob.status]
                return (
                  <tr key={`${ob.name}-${ob.period}`} className={cn("border-b border-border", i % 2 === 0 ? "bg-card" : "bg-muted/10")}>
                    <td className="px-4 py-3"><span className="text-sm font-medium text-foreground">{ob.name}</span></td>
                    <td className="px-4 py-3"><span className="text-sm text-foreground">{ob.period}</span></td>
                    <td className="px-4 py-3"><span className="text-sm text-foreground">{new Date(ob.deadline + "T00:00:00").toLocaleDateString("pt-BR")}</span></td>
                    <td className="px-4 py-3"><div className="flex justify-center"><Badge variant="secondary" className={cn("text-xs", st.className)}>{st.label}</Badge></div></td>
                  </tr>
                )
              })}
            </tbody></table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
