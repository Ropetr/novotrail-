"use client"

import { useState } from "react"
import { Save, DollarSign, Percent, User, Building2, Mail, Phone, MapPin, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useCreateParceiro, useUpdateParceiro } from "@/hooks/use-parceiros"

interface PartnerFormProps {
  partner?: any
  onClose: () => void
  viewMode?: "new" | "edit" | "view"
}

export function PartnerForm({ partner, onClose, viewMode = "new" }: PartnerFormProps) {
  const [commissionRate, setCommissionRate] = useState(partner?.commissionRate || 5)
  const [isSaving, setIsSaving] = useState(false)
  const isViewOnly = viewMode === "view"
  const isEditing = viewMode === "edit"

  const createParceiro = useCreateParceiro()
  const updateParceiro = useUpdateParceiro()

  const handleSave = async () => {
    const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || ""
    
    const payload: Record<string, unknown> = {
      name: partner?.name || "",
      tradeName: partner?.tradeName || undefined,
      type: partner?.type || "pf",
      document: partner?.document || "",
      email: partner?.email || "",
      phone: partner?.phone || "",
      city: partner?.city || "",
      state: partner?.state || "",
      commissionRate: commissionRate,
      notes: getVal("notes") || undefined,
    }

    if (!payload.name || !payload.document) {
      toast.error("Dados do parceiro incompletos")
      return
    }

    setIsSaving(true)
    try {
      if (isEditing && partner?.id) {
        await updateParceiro.mutateAsync({ id: partner.id, data: { commissionRate, notes: getVal("notes") || undefined } })
      } else {
        await createParceiro.mutateAsync(payload as any)
      }
      onClose()
    } catch (error: any) {
      console.error("Erro ao salvar parceiro:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-3 [&_input]:h-8 [&_button[role='combobox']]:h-8">
      <div className="flex items-center justify-end gap-2">
        {!isViewOnly && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 w-8 text-primary hover:text-primary/80"
            title="Salvar"
          >
            <Save className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-primary hover:text-primary/80"
          title="Fechar"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      {/* Info: Dados do Cliente (somente leitura) */}
      <Card className="bg-muted/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {partner?.type === "pj" ? <Building2 className="h-5 w-5 text-primary" /> : <User className="h-5 w-5 text-primary" />}
            Dados do Cliente (vinculado automaticamente)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Nome / Razão Social</Label>
              <Input value={partner?.name || ""} disabled className="bg-background" />
            </div>
            {partner?.tradeName && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">Nome Fantasia</Label>
                <Input value={partner?.tradeName} disabled className="bg-background" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-muted-foreground">{partner?.type === "pj" ? "CNPJ" : "CPF"}</Label>
              <Input value={partner?.document || ""} disabled className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                E-mail
              </Label>
              <Input value={partner?.email || ""} disabled className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Telefone
              </Label>
              <Input value={partner?.phone || ""} disabled className="bg-background" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Cidade
              </Label>
              <Input value={partner?.city || ""} disabled className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Estado</Label>
              <Input value={partner?.state || ""} disabled className="bg-background" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuração de Comissão (Cashback) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Configuração de Cashback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="commissionRate">Percentual de Cashback (%) *</Label>
              <div className="relative">
                <Input
                  id="commissionRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="5.00"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                  disabled={isViewOnly}
                  className="pr-8"
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                A cada venda indicada, o parceiro recebe este percentual em créditos
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalCommission">Total Acumulado em Cashback</Label>
              <Input
                id="totalCommission"
                value={partner?.totalCommission ? `R$ ${partner.totalCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "R$ 0,00"}
                disabled
                className="bg-muted/10 text-green-600 font-medium"
              />
              <p className="text-xs text-muted-foreground">
                Crédito disponível para uso em compras
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações sobre a Parceria</Label>
            <Textarea
              id="notes"
              placeholder="Ex: Parceiro ativo desde 2024, indicações de projetos comerciais..."
              rows={3}
              disabled={isViewOnly}
              defaultValue={partner?.notes || ""}
            />
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 p-4">
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Como funciona o Cashback?
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Quando este parceiro indicar um cliente e a venda for concluída, ele receberá automaticamente
                  <strong> {commissionRate}% do valor da venda</strong> em créditos. Esses créditos podem ser utilizados
                  em compras futuras na empresa.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}










