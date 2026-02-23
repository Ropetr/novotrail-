"use client"

import React, { useState } from "react"
import {
  Save,
  Search,
  X,
  Info,
  FileText,
  DollarSign,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useVendas } from "@/hooks/use-vendas"
import { useCreateDevolucao, useUpdateDevolucao } from "@/hooks/use-devolucoes"

interface Return {
  id: string
  number: string
  date: string
  saleNumber: string
  saleDate: string
  clientName: string
  clientDocument: string
  items: number
  returnValue: number
  status: "pending" | "approved" | "rejected" | "processing" | "completed"
  refundStatus: "pending" | "partial" | "completed"
  reason: string
  notes?: string
}

interface ReturnFormProps {
  returnData?: Return | null
  onClose: () => void
  viewMode?: "new" | "edit" | "view"
}

type TabType = "geral" | "itens" | "reembolso"

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "geral", label: "Dados Gerais", icon: Info },
  { id: "itens", label: "Itens para Devolução", icon: FileText },
  { id: "reembolso", label: "Reembolso", icon: DollarSign },
]

// Dados carregados da API (substituem arrays mock antigos)

// Motivos de devolução
const returnReasons = [
  { value: "defective", label: "Produto com defeito" },
  { value: "wrong_product", label: "Produto errado entregue" },
  { value: "damaged", label: "Produto danificado no transporte" },
  { value: "regret", label: "Arrependimento (7 dias)" },
  { value: "warranty", label: "Garantia" },
  { value: "other", label: "Outro motivo" },
]

interface ReturnItem {
  itemId: string
  name: string
  maxQuantity: number
  returnQuantity: number
  unitPrice: number
  totalPrice: number
}

export function ReturnForm({ returnData, onClose, viewMode = "new" }: ReturnFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>("geral")
  const [isSaving, setIsSaving] = useState(false)
  const isViewOnly = viewMode === "view"
  const isEditing = viewMode === "edit"

  // Dados da API
  const { data: vendasData } = useVendas({ limit: 200 })
  const createMutation = useCreateDevolucao()
  const updateMutation = useUpdateDevolucao()

  const availableSales = (vendasData?.data || []).map((v: any) => ({
    id: v.id,
    number: v.number || "",
    date: v.date ? v.date.split("T")[0] : "",
    clientName: v.clientName || "Cliente",
    clientDocument: v.clientDocument || "",
    clientId: v.clientId || "",
    totalValue: Number(v.total || 0),
    items: (v.items || []).map((i: any) => ({
      id: i.id,
      productId: i.productId,
      name: i.productName || "Produto",
      quantity: Number(i.quantity || 0),
      unitPrice: Number(i.unitPrice || 0),
      returned: 0,
    })),
  }))

  const [saleSearchTerm, setSaleSearchTerm] = useState("")
  const [selectedSale, setSelectedSale] = useState<typeof availableSales[0] | null>(null)
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([])

  const [formData, setFormData] = useState({
    // Dados Gerais
    number: returnData?.number || "",
    date: returnData?.date || new Date().toISOString().split("T")[0],
    saleNumber: returnData?.saleNumber || "",
    reason: returnData?.reason || "",
    customReason: "",
    status: returnData?.status || "pending",
    // Reembolso
    refundMethod: "",
    refundStatus: returnData?.refundStatus || "pending",
    refundValue: 0,
    notes: returnData?.notes || "",
  })

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaleSelect = (sale: typeof availableSales[0]) => {
    setSelectedSale(sale)
    setSaleSearchTerm("")
    setFormData((prev) => ({
      ...prev,
      saleNumber: sale.number,
    }))
  }

  const handleItemSelect = (item: typeof availableSales[0]["items"][0], checked: boolean) => {
    if (checked) {
      const newItem: ReturnItem = {
        itemId: item.id,
        name: item.name,
        maxQuantity: item.quantity - item.returned,
        returnQuantity: 1,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice,
      }
      setReturnItems((prev) => [...prev, newItem])
    } else {
      setReturnItems((prev) => prev.filter((i) => i.itemId !== item.id))
    }
  }

  const updateReturnQuantity = (itemId: string, quantity: number) => {
    setReturnItems((prev) =>
      prev.map((item) => {
        if (item.itemId === itemId) {
          const validQuantity = Math.max(1, Math.min(quantity, item.maxQuantity))
          return {
            ...item,
            returnQuantity: validQuantity,
            totalPrice: validQuantity * item.unitPrice,
          }
        }
        return item
      })
    )
  }

  const getTotalReturnValue = () => {
    return returnItems.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  const filteredSales = availableSales.filter(
    (s) =>
      saleSearchTerm &&
      (s.number.toLowerCase().includes(saleSearchTerm.toLowerCase()) ||
        s.clientName.toLowerCase().includes(saleSearchTerm.toLowerCase()))
  )

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Validações básicas
      if (!selectedSale) {
        toast.error("Selecione uma venda")
        setActiveTab("geral")
        return
      }
      if (!formData.reason) {
        toast.error("Selecione o motivo da devolução")
        setActiveTab("geral")
        return
      }
      if (returnItems.length === 0) {
        toast.error("Selecione pelo menos um item para devolução")
        setActiveTab("itens")
        return
      }

      const payload = {
        saleId: selectedSale.id,
        clientId: (selectedSale as any).clientId || "",
        date: formData.date,
        reason: formData.reason || undefined,
        refundType: (formData as any).refundMethod === "credit" ? "credit" as const : "money" as const,
        notes: formData.notes || undefined,
        items: returnItems.map((item) => ({
          productId: (item as any).productId || item.itemId,
          quantity: item.returnQuantity,
          unitPrice: item.unitPrice,
          reason: formData.reason || undefined,
        })),
      }

      if (isEditing && returnData?.id) {
        await updateMutation.mutateAsync({ id: returnData.id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onClose()
    } catch (error) {
      toast.error("Erro ao salvar devolução. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-3 [&_input]:h-8 [&_button[role='combobox']]:h-8">
      {/* Tabs */}
      <div className="relative border-b-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border">
        <div className="flex items-end justify-between gap-3">
          <nav className="flex gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 h-8 text-sm font-medium rounded-t-md border border-transparent transition-colors",
                    activeTab === tab.id
                      ? "border-border border-b-background bg-background text-foreground -mb-px"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
          <div className="flex items-center gap-2 self-end">
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
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid gap-6">
        {/* Dados Gerais */}
        {activeTab === "geral" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="h-8 px-4 py-0 flex items-center border-b border-border/60">
                <CardTitle className="text-base">Informações da Devolução</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="number">Número da Devolução</Label>
                    <Input
                      id="number"
                      value={formData.number}
                      onChange={(e) => handleInputChange("number", e.target.value)}
                      placeholder="Ex: DEV-2024-001"
                      disabled={isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Data da Devolução *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status da Devolução</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="approved">Aprovada</SelectItem>
                      <SelectItem value="rejected">Rejeitada</SelectItem>
                      <SelectItem value="processing">Processando</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="h-8 px-4 py-0 flex items-center border-b border-border/60">
                <CardTitle className="text-base">Venda Origem e Motivo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Busca de Venda */}
                <div className="space-y-2">
                  <Label>Venda *</Label>
                  {selectedSale ? (
                    <div className="p-3 rounded-lg border border-border bg-muted/10">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium">{selectedSale.number}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(selectedSale.date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedSale(null)
                            setReturnItems([])
                            setFormData((prev) => ({ ...prev, saleNumber: "" }))
                          }}
                        >
                          Alterar
                        </Button>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Cliente:</p>
                        <p className="text-sm">{selectedSale.clientName}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={saleSearchTerm}
                          onChange={(e) => setSaleSearchTerm(e.target.value)}
                          placeholder="Buscar venda por número ou cliente..."
                          className="pl-10"
                        />
                      </div>
                      {filteredSales.length > 0 && (
                        <div className="absolute left-0 right-0 top-full z-50 mt-1 border border-border rounded-md bg-background shadow-lg max-h-48 overflow-y-auto">
                          {filteredSales.map((sale) => (
                            <button
                              key={sale.id}
                              type="button"
                              onClick={() => handleSaleSelect(sale)}
                              className="w-full flex flex-col p-3 hover:bg-muted/10 transition-colors text-left border-b border-border last:border-b-0"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium">{sale.number}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(sale.date).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">{sale.clientName}</p>
                              <p className="text-xs text-muted-foreground">
                                {sale.items.length} itens •{" "}
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(sale.totalValue)}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Motivo da Devolução */}
                <div className="space-y-2">
                  <Label>Motivo da Devolução *</Label>
                  <Select
                    value={formData.reason}
                    onValueChange={(value) => handleInputChange("reason", value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione um motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {returnReasons.map((reason) => (
                        <SelectItem key={reason.value} value={reason.label}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.reason === "Outro motivo" && (
                  <div className="space-y-2">
                    <Label htmlFor="customReason">Especifique o motivo</Label>
                    <Input
                      id="customReason"
                      value={formData.customReason}
                      onChange={(e) => handleInputChange("customReason", e.target.value)}
                      placeholder="Descreva o motivo da devolução"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Itens para Devolução */}
        {activeTab === "itens" && (
          <div className="grid gap-6">
            <Card>
              <CardHeader className="h-8 px-4 py-0 flex items-center border-b border-border/60">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Selecionar Itens para Devolução
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!selectedSale ? (
                  <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-md">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Selecione uma venda primeiro</p>
                    <p className="text-xs mt-1">
                      Vá para a aba "Dados Gerais" e selecione uma venda
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Lista de itens disponíveis */}
                    <div className="space-y-2">
                      <Label>Itens da Venda {selectedSale.number}</Label>
                      <div className="border border-border rounded-md">
                        {selectedSale.items.map((item: any) => {
                          const isSelected = returnItems.some((ri) => ri.itemId === item.id)
                          const returnItem = returnItems.find((ri) => ri.itemId === item.id)

                          return (
                            <div
                              key={item.id}
                              className="p-3 border-b border-border last:border-b-0"
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) =>
                                    handleItemSelect(item, checked as boolean)
                                  }
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Quantidade vendida: {item.quantity} • Devolvido: {item.returned} •
                                    Disponível: {item.quantity - item.returned}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Valor unitário:{" "}
                                    {new Intl.NumberFormat("pt-BR", {
                                      style: "currency",
                                      currency: "BRL",
                                    }).format(item.unitPrice)}
                                  </p>

                                  {isSelected && returnItem && (
                                    <div className="mt-2 flex items-center gap-2">
                                      <Label className="text-xs">Qtd a devolver:</Label>
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateReturnQuantity(
                                              item.id,
                                              returnItem.returnQuantity - 1
                                            )
                                          }
                                          className="h-6 w-6 rounded border border-border flex items-center justify-center hover:bg-muted text-xs"
                                        >
                                          -
                                        </button>
                                        <Input
                                          type="number"
                                          value={returnItem.returnQuantity}
                                          onChange={(e) =>
                                            updateReturnQuantity(
                                              item.id,
                                              parseInt(e.target.value) || 0
                                            )
                                          }
                                          className="w-16 h-6 text-center text-sm px-1"
                                          min="1"
                                          max={returnItem.maxQuantity}
                                        />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateReturnQuantity(
                                              item.id,
                                              returnItem.returnQuantity + 1
                                            )
                                          }
                                          className="h-6 w-6 rounded border border-border flex items-center justify-center hover:bg-muted text-xs"
                                        >
                                          +
                                        </button>
                                      </div>
                                      <span className="text-xs text-muted-foreground ml-2">
                                        Total:{" "}
                                        {new Intl.NumberFormat("pt-BR", {
                                          style: "currency",
                                          currency: "BRL",
                                        }).format(returnItem.totalPrice)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Resumo */}
                    {returnItems.length > 0 && (
                      <div className="p-4 rounded-lg bg-muted/10 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Itens selecionados:</span>
                          <span className="font-medium">{returnItems.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Quantidade total:</span>
                          <span className="font-medium">
                            {returnItems.reduce((sum, item) => sum + item.returnQuantity, 0)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-border">
                          <span className="text-base font-medium">Valor da Devolução:</span>
                          <span className="text-lg font-bold text-primary">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(getTotalReturnValue())}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reembolso */}
        {activeTab === "reembolso" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="h-8 px-4 py-0 flex items-center border-b border-border/60">
                <CardTitle className="text-base">Informações de Reembolso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 rounded-lg bg-muted/10 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valor da Devolução:</span>
                    <span className="font-bold text-primary">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(getTotalReturnValue())}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Método de Reembolso</Label>
                  <Select
                    value={formData.refundMethod}
                    onValueChange={(value) => handleInputChange("refundMethod", value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="same">Mesma forma de pagamento</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                      <SelectItem value="credit">Crédito em Loja</SelectItem>
                      <SelectItem value="exchange">Troca por outro produto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status do Reembolso</Label>
                  <Select
                    value={formData.refundStatus}
                    onValueChange={(value) => handleInputChange("refundStatus", value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="partial">Parcial</SelectItem>
                      <SelectItem value="completed">Completo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refundValue">Valor Reembolsado</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      R$
                    </span>
                    <Input
                      id="refundValue"
                      type="number"
                      value={formData.refundValue}
                      onChange={(e) =>
                        handleInputChange("refundValue", parseFloat(e.target.value) || 0)
                      }
                      className="pl-10"
                      step="0.01"
                      max={getTotalReturnValue()}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Máximo: {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(getTotalReturnValue())}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="h-8 px-4 py-0 flex items-center border-b border-border/60">
                <CardTitle className="text-base">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Informações adicionais sobre a devolução, condições especiais, análise técnica..."
                  rows={14}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}














