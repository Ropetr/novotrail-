"use client"
import { useState } from "react"
import { Save, X, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface MovementEntity {
  id: string
  code: string
  type: string
  product: string
  productCode: string
  quantity: number
  unit: string
  warehouse: string
  reason: string
  date: string
  user: string
  nfNumber?: string
}

interface MovementFormProps { movement?: MovementEntity | null; onClose: () => void; viewMode?: "new" | "view" }
export function MovementForm({ movement, onClose, viewMode = "new" }: MovementFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const isViewOnly = viewMode === "view"
  const handleSave = async () => { setIsSaving(true); try { await new Promise(r => setTimeout(r, 1000)); toast.success("Movimentação registrada!"); onClose() } catch { toast.error("Erro ao salvar.") } finally { setIsSaving(false) } }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button><h1 className="text-lg font-semibold text-foreground">{isViewOnly ? "Visualizar Movimentação" : "Nova Movimentação"}</h1></div>
        {!isViewOnly && <div className="flex gap-2"><Button variant="outline" size="sm" onClick={onClose}><X className="mr-2 h-4 w-4" />Cancelar</Button><Button size="sm" onClick={handleSave} disabled={isSaving}><Save className="mr-2 h-4 w-4" />{isSaving ? "Salvando..." : "Registrar"}</Button></div>}
      </div>
      <Card><CardHeader className="border-b border-border/60 py-3 px-4"><CardTitle className="text-base">Dados da Movimentação</CardTitle></CardHeader>
        <CardContent className="space-y-3 p-4 [&_input]:h-8 [&_button[role='combobox']]:h-8">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2"><Label>Tipo *</Label><Select disabled={isViewOnly} defaultValue={movement?.type}><SelectTrigger className="h-8"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="entrada">Entrada</SelectItem><SelectItem value="saida">Saída</SelectItem><SelectItem value="ajuste">Ajuste</SelectItem><SelectItem value="transferencia">Transferência</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Produto *</Label><Select disabled={isViewOnly}><SelectTrigger className="h-8"><SelectValue placeholder="Selecione o produto" /></SelectTrigger><SelectContent><SelectItem value="1">Placa Drywall ST 12.5mm</SelectItem><SelectItem value="2">Perfil Montante 48mm</SelectItem><SelectItem value="3">Massa Corrida 25kg</SelectItem><SelectItem value="4">Fita Papel 50m</SelectItem><SelectItem value="5">Parafuso Drywall 3.5x25</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Depósito *</Label><Select disabled={isViewOnly} defaultValue="Galpão Principal"><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Galpão Principal">Galpão Principal</SelectItem><SelectItem value="Galpão Secundário">Galpão Secundário</SelectItem><SelectItem value="Loja">Loja</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2"><Label>Quantidade *</Label><Input type="number" placeholder="0" defaultValue={movement?.quantity} disabled={isViewOnly} /></div>
            <div className="space-y-2"><Label>Data *</Label><Input type="date" defaultValue={movement?.date || new Date().toISOString().split("T")[0]} disabled={isViewOnly} /></div>
            <div className="space-y-2"><Label>NF Referência</Label><Input placeholder="Número da NF" defaultValue={movement?.nfNumber} disabled={isViewOnly} /></div>
          </div>
          <div className="space-y-2"><Label>Motivo / Observações *</Label><Textarea placeholder="Descreva o motivo da movimentação..." className="min-h-[80px]" defaultValue={movement?.reason} disabled={isViewOnly} /></div>
        </CardContent>
      </Card>
    </div>
  )
}
