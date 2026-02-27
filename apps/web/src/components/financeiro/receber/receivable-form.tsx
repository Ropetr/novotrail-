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

interface ReceivableFormProps { receivable?: any; onClose: () => void; viewMode?: "new" | "edit" | "view" }

export function ReceivableForm({ receivable, onClose, viewMode = "new" }: ReceivableFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const isViewOnly = viewMode === "view"
  const isEditing = viewMode === "edit"

  const handleSave = async () => {
    setIsSaving(true)
    try { await new Promise((r) => setTimeout(r, 1000)); toast.success(isEditing ? "Recebível atualizado!" : "Recebível cadastrado!"); onClose() }
    catch { toast.error("Erro ao salvar.") } finally { setIsSaving(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="text-lg font-semibold text-foreground">{isViewOnly ? "Visualizar Recebível" : isEditing ? "Editar Recebível" : "Novo Recebível"}</h1>
        </div>
        {!isViewOnly && <div className="flex gap-2"><Button variant="outline" size="sm" onClick={onClose}><X className="mr-2 h-4 w-4" />Cancelar</Button><Button size="sm" onClick={handleSave} disabled={isSaving}><Save className="mr-2 h-4 w-4" />{isSaving ? "Salvando..." : "Salvar"}</Button></div>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card><CardHeader className="border-b border-border/60 py-3 px-4"><CardTitle className="text-base">Dados do Recebível</CardTitle></CardHeader>
          <CardContent className="space-y-3 p-4 [&_input]:h-8 [&_button[role='combobox']]:h-8">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Cliente *</Label><Select disabled={isViewOnly}><SelectTrigger className="h-8"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger><SelectContent><SelectItem value="1">Construtora Horizonte</SelectItem><SelectItem value="2">Mendes Reformas</SelectItem><SelectItem value="3">Casa & Cia Materiais</SelectItem><SelectItem value="4">PF Construções</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Origem</Label><Select disabled={isViewOnly}><SelectTrigger className="h-8"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="Venda">Venda</SelectItem><SelectItem value="Serviço">Serviço</SelectItem><SelectItem value="Outros">Outros</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>Descrição *</Label><Input placeholder="Descrição do recebível" defaultValue={receivable?.description} disabled={isViewOnly} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Valor *</Label><Input type="number" step="0.01" placeholder="0,00" defaultValue={receivable?.value} disabled={isViewOnly} /></div>
              <div className="space-y-2"><Label>Vencimento *</Label><Input type="date" defaultValue={receivable?.dueDate} disabled={isViewOnly} /></div>
              <div className="space-y-2"><Label>Venda Ref.</Label><Input placeholder="VND-000" defaultValue={receivable?.saleCode} disabled={isViewOnly} /></div>
            </div>
          </CardContent>
        </Card>
        <Card><CardHeader className="border-b border-border/60 py-3 px-4"><CardTitle className="text-base">Recebimento</CardTitle></CardHeader>
          <CardContent className="space-y-3 p-4 [&_input]:h-8 [&_button[role='combobox']]:h-8">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Forma de Recebimento</Label><Select disabled={isViewOnly}><SelectTrigger className="h-8"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="Boleto">Boleto</SelectItem><SelectItem value="PIX">PIX</SelectItem><SelectItem value="Cartão">Cartão</SelectItem><SelectItem value="Transferência">Transferência</SelectItem><SelectItem value="Cheque">Cheque</SelectItem><SelectItem value="Dinheiro">Dinheiro</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Conta Bancária</Label><Select disabled={isViewOnly}><SelectTrigger className="h-8"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="bb">Banco do Brasil</SelectItem><SelectItem value="itau">Itaú</SelectItem><SelectItem value="sicoob">Sicoob</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Valor Recebido</Label><Input type="number" step="0.01" placeholder="0,00" defaultValue={receivable?.receivedValue} disabled={isViewOnly} /></div>
              <div className="space-y-2"><Label>Data Recebimento</Label><Input type="date" defaultValue={receivable?.receivedAt} disabled={isViewOnly} /></div>
            </div>
            <div className="space-y-2"><Label>Observações</Label><Textarea placeholder="Observações..." className="min-h-[80px]" disabled={isViewOnly} /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
