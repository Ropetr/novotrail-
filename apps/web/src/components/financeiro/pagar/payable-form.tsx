"use client"

import { useState } from "react"
import { Save, X, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface PayableFormProps {
  payable?: any
  onClose: () => void
  viewMode?: "new" | "edit" | "view"
}

export function PayableForm({ payable, onClose, viewMode = "new" }: PayableFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const isViewOnly = viewMode === "view"
  const isEditing = viewMode === "edit"

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success(isEditing ? "Conta atualizada com sucesso!" : "Conta cadastrada com sucesso!")
      onClose()
    } catch {
      toast.error("Erro ao salvar conta. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            {isViewOnly ? "Visualizar Conta" : isEditing ? "Editar Conta" : "Nova Conta a Pagar"}
          </h1>
        </div>
        {!isViewOnly && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}><X className="mr-2 h-4 w-4" />Cancelar</Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />{isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        )}
      </div>

      {/* Form */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="border-b border-border/60 py-3 px-4">
            <CardTitle className="text-base">Dados da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 [&_input]:h-8 [&_button[role='combobox']]:h-8">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Fornecedor *</Label>
                <Select disabled={isViewOnly} defaultValue={payable?.supplier}>
                  <SelectTrigger className="h-8"><SelectValue placeholder="Selecione o fornecedor" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Knauf do Brasil">Knauf do Brasil</SelectItem>
                    <SelectItem value="Gypsum Mineração">Gypsum Mineração</SelectItem>
                    <SelectItem value="Eucatex S/A">Eucatex S/A</SelectItem>
                    <SelectItem value="Placo Saint-Gobain">Placo Saint-Gobain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select disabled={isViewOnly} defaultValue={payable?.category}>
                  <SelectTrigger className="h-8"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mercadorias">Mercadorias</SelectItem>
                    <SelectItem value="Energia">Energia</SelectItem>
                    <SelectItem value="Água">Água</SelectItem>
                    <SelectItem value="Telecom">Telecom</SelectItem>
                    <SelectItem value="Serviços">Serviços</SelectItem>
                    <SelectItem value="Frete">Frete</SelectItem>
                    <SelectItem value="Aluguel">Aluguel</SelectItem>
                    <SelectItem value="Impostos">Impostos</SelectItem>
                    <SelectItem value="Folha">Folha de Pagamento</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Input placeholder="Descrição da conta" defaultValue={payable?.description} disabled={isViewOnly} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Valor *</Label>
                <Input type="number" step="0.01" placeholder="0,00" defaultValue={payable?.value} disabled={isViewOnly} />
              </div>
              <div className="space-y-2">
                <Label>Data de Vencimento *</Label>
                <Input type="date" defaultValue={payable?.dueDate} disabled={isViewOnly} />
              </div>
              <div className="space-y-2">
                <Label>NF Referência</Label>
                <Input placeholder="Número da NF" defaultValue={payable?.nfNumber} disabled={isViewOnly} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border/60 py-3 px-4">
            <CardTitle className="text-base">Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 [&_input]:h-8 [&_button[role='combobox']]:h-8">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select disabled={isViewOnly} defaultValue={payable?.paymentMethod}>
                  <SelectTrigger className="h-8"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Boleto">Boleto Bancário</SelectItem>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                    <SelectItem value="Débito Automático">Débito Automático</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Conta Bancária</Label>
                <Select disabled={isViewOnly}>
                  <SelectTrigger className="h-8"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bb">Banco do Brasil - CC 12345-6</SelectItem>
                    <SelectItem value="itau">Itaú - CC 78901-2</SelectItem>
                    <SelectItem value="sicoob">Sicoob - CC 45678-9</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Valor Pago</Label>
                <Input type="number" step="0.01" placeholder="0,00" defaultValue={payable?.paidValue} disabled={isViewOnly} />
              </div>
              <div className="space-y-2">
                <Label>Data do Pagamento</Label>
                <Input type="date" defaultValue={payable?.paidAt?.split("T")[0]} disabled={isViewOnly} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea placeholder="Observações adicionais..." className="min-h-[80px]" defaultValue={payable?.notes} disabled={isViewOnly} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
