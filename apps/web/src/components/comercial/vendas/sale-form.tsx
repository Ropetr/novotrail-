"use client"

import React, { useState } from "react"
import {
  Save,
  Search,
  Trash2,
  X,
  Info,
  Users,
  FileText,
  DollarSign,
  Truck,
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
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useClientes } from "@/hooks/use-clientes"
import { useColaboradores } from "@/hooks/use-colaboradores"
import { useProdutos } from "@/hooks/use-produtos"
import { useCreateVenda, useUpdateVenda } from "@/hooks/use-vendas"

interface Sale {
  id: string
  number: string
  date: string
  clientName: string
  clientDocument: string
  seller: string
  items: number
  totalValue: number
  discount: number
  finalValue: number
  status: "pending" | "confirmed" | "separated" | "shipped" | "delivered" | "cancelled"
  paymentStatus: "pending" | "partial" | "paid"
  paymentMethod: string
  notes?: string
}

interface SaleFormProps {
  sale?: Sale | null
  onClose: () => void
  viewMode?: "new" | "edit" | "view"
}

type TabType = "geral" | "itens" | "totais" | "entrega"

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "geral", label: "Dados Gerais", icon: Info },
  { id: "itens", label: "Itens da Venda", icon: FileText },
  { id: "totais", label: "Totais e Pagamento", icon: DollarSign },
  { id: "entrega", label: "Entrega e Observações", icon: Truck },
]

// Dados carregados da API (substituem arrays mock antigos)

interface SaleItem {
  id: string
  productId: string
  sku: string
  name: string
  quantity: number
  unit: string
  unitPrice: number
  discount: number
  totalPrice: number
}

export function SaleForm({ sale, onClose, viewMode = "new" }: SaleFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>("geral")
  const [isSaving, setIsSaving] = useState(false)
  const isViewOnly = viewMode === "view"
  const isEditing = viewMode === "edit"

  // Dados da API
  const { data: clientesData } = useClientes({ limit: 200 })
  const { data: colaboradoresData } = useColaboradores({ limit: 200 })
  const { data: produtosData } = useProdutos({ limit: 200 })
  const createMutation = useCreateVenda()
  const updateMutation = useUpdateVenda()

  const availableClients = (clientesData?.data || []).map((c: any) => ({
    id: c.id,
    name: c.name || c.tradeName || "Sem nome",
    document: c.document || "",
  }))

  const availableSellers = (colaboradoresData?.data || []).map((e: any) => ({
    id: e.id,
    name: e.name || "Sem nome",
  }))

  const availableProducts = (produtosData?.data || []).map((p: any) => ({
    id: p.id,
    sku: p.sku || p.code || "",
    name: p.name || "Sem nome",
    price: Number(p.salePrice || p.price || 0),
    unit: p.unit || "UN",
    stock: Number(p.currentStock || p.stock || 0),
  }))

  const [items, setItems] = useState<SaleItem[]>([])
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [clientSearchTerm, setClientSearchTerm] = useState("")

  const [formData, setFormData] = useState({
    // Dados Gerais
    number: sale?.number || "",
    date: sale?.date || new Date().toISOString().split("T")[0],
    clientId: "",
    clientName: sale?.clientName || "",
    clientDocument: sale?.clientDocument || "",
    sellerId: "",
    sellerName: sale?.seller || "",
    status: sale?.status || "pending",
    // Totais
    subtotal: 0,
    discountPercent: 0,
    discountValue: 0,
    finalValue: sale?.finalValue || 0,
    // Pagamento
    paymentMethod: sale?.paymentMethod || "",
    paymentTerm: "",
    paymentStatus: sale?.paymentStatus || "pending",
    // Entrega
    deliveryAddress: "",
    deliveryCity: "",
    deliveryState: "",
    deliveryZipCode: "",
    deliveryDate: "",
    notes: sale?.notes || "",
  })

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleClientSelect = (client: typeof availableClients[0]) => {
    setFormData((prev) => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
      clientDocument: client.document,
    }))
    setClientSearchTerm("")
  }

  const handleSellerSelect = (sellerId: string) => {
    const seller = availableSellers.find((s) => s.id === sellerId)
    if (seller) {
      setFormData((prev) => ({
        ...prev,
        sellerId: seller.id,
        sellerName: seller.name,
      }))
    }
  }

  // Funções para gerenciar itens da venda
  const parseProductSearch = (term: string) => {
    const trimmed = term.trim()
    if (!trimmed) {
      return { qty: 1, query: "" }
    }
    const match = trimmed.match(/^(\d+)\s*[xX]?\s+(.*)$/)
    if (match) {
      return { qty: Math.max(1, parseInt(match[1], 10) || 1), query: match[2].trim() }
    }
    return { qty: 1, query: trimmed }
  }

  const addItem = (product: typeof availableProducts[0], quantity: number) => {
    const qty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1
    const existingItem = items.find((item) => item.productId === product.id)
    if (existingItem) {
      updateItemQuantity(existingItem.id, existingItem.quantity + qty)
    } else {
      const newItem: SaleItem = {
        id: Date.now().toString(),
        productId: product.id,
        sku: product.sku,
        name: product.name,
        quantity: qty,
        unit: product.unit,
        unitPrice: product.price,
        discount: 0,
        totalPrice: product.price * qty,
      }
      setItems((prev) => [...prev, newItem])
    }
    setProductSearchTerm("")
  }

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const subtotal = item.unitPrice * quantity
          const discountAmount = subtotal * (item.discount / 100)
          const totalPrice = subtotal - discountAmount
          return { ...item, quantity, totalPrice }
        }
        return item
      })
    )
  }

  const updateItemDiscount = (itemId: string, discount: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const subtotal = item.unitPrice * item.quantity
          const discountAmount = subtotal * (discount / 100)
          const totalPrice = subtotal - discountAmount
          return { ...item, discount, totalPrice }
        }
        return item
      })
    )
  }

  const updateItemPrice = (itemId: string, unitPrice: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const subtotal = unitPrice * item.quantity
          const discountAmount = subtotal * (item.discount / 100)
          const totalPrice = subtotal - discountAmount
          return { ...item, unitPrice, totalPrice }
        }
        return item
      })
    )
  }

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  // Cálculos de totais
  const getSubtotal = () => {
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  }

  const getTotalDiscount = () => {
    const itemsDiscount = items.reduce((sum, item) => {
      const subtotal = item.unitPrice * item.quantity
      return sum + subtotal * (item.discount / 100)
    }, 0)
    const generalDiscount = getSubtotal() * (formData.discountPercent / 100)
    return itemsDiscount + generalDiscount
  }

  const getFinalValue = () => {
    return getSubtotal() - getTotalDiscount()
  }

  const { qty: parsedQty, query: parsedQuery } = parseProductSearch(productSearchTerm)

  const filteredProducts = availableProducts.filter(
    (p) =>
      parsedQuery &&
      (p.name.toLowerCase().includes(parsedQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(parsedQuery.toLowerCase()))
  )

  const filteredClients = availableClients.filter(
    (c) =>
      clientSearchTerm &&
      (c.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        c.document.includes(clientSearchTerm))
  )

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Validações básicas
      if (!formData.clientName) {
        toast.error("Selecione um cliente")
        setActiveTab("geral")
        return
      }
      if (!formData.sellerName) {
        toast.error("Selecione um vendedor")
        setActiveTab("geral")
        return
      }
      if (items.length === 0) {
        toast.error("Adicione pelo menos um item à venda")
        setActiveTab("itens")
        return
      }
      if (!formData.paymentMethod) {
        toast.error("Selecione a forma de pagamento")
        setActiveTab("totais")
        return
      }

      const payload = {
        clientId: formData.clientId,
        sellerId: formData.sellerId || undefined,
        date: formData.date,
        discount: formData.discountPercent,
        paymentMethod: formData.paymentMethod || undefined,
        notes: formData.notes || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
        })),
      }

      if (isEditing && sale?.id) {
        await updateMutation.mutateAsync({ id: sale.id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onClose()
    } catch (error) {
      toast.error("Erro ao salvar venda. Tente novamente.")
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
                <CardTitle className="text-base">Informações da Venda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="number">Número da Venda</Label>
                    <Input
                      id="number"
                      value={formData.number}
                      onChange={(e) => handleInputChange("number", e.target.value)}
                      placeholder="Ex: VND-2024-001"
                      disabled={isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Data da Venda *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status da Venda</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="confirmed">Confirmada</SelectItem>
                      <SelectItem value="separated">Separada</SelectItem>
                      <SelectItem value="shipped">Enviada</SelectItem>
                      <SelectItem value="delivered">Entregue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="h-8 px-4 py-0 flex items-center border-b border-border/60">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Cliente e Vendedor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Busca de Cliente */}
                <div className="space-y-2">
                  <Label>Cliente *</Label>
                  {formData.clientName ? (
                    <div className="p-3 rounded-lg border border-border bg-muted/10 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{formData.clientName}</p>
                        <p className="text-xs text-muted-foreground">
                          CNPJ: {formData.clientDocument}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            clientId: "",
                            clientName: "",
                            clientDocument: "",
                          }))
                        }
                      >
                        Alterar
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={clientSearchTerm}
                          onChange={(e) => setClientSearchTerm(e.target.value)}
                          placeholder="Buscar cliente por nome ou CNPJ..."
                          className="pl-10"
                        />
                      </div>
                      {filteredClients.length > 0 && (
                        <div className="absolute left-0 right-0 top-full z-50 mt-1 border border-border rounded-md bg-background shadow-lg max-h-48 overflow-y-auto">
                          {filteredClients.map((client) => (
                            <button
                              key={client.id}
                              type="button"
                              onClick={() => handleClientSelect(client)}
                              className="w-full flex flex-col p-3 hover:bg-muted/10 transition-colors text-left border-b border-border last:border-b-0"
                            >
                              <p className="text-sm font-medium">{client.name}</p>
                              <p className="text-xs text-muted-foreground">
                                CNPJ: {client.document}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Seleção de Vendedor */}
                <div className="space-y-2">
                  <Label>Vendedor *</Label>
                  <Select value={formData.sellerId} onValueChange={handleSellerSelect}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione um vendedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSellers.map((seller) => (
                        <SelectItem key={seller.id} value={seller.id}>
                          {seller.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Itens da Venda */}
        {activeTab === "itens" && (
          <div className="grid gap-6">
            <Card>
              <CardHeader className="h-8 px-4 py-0 flex items-center border-b border-border/60">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Produtos e Serviços
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Busca de produtos */}
                <div className="space-y-2">
                  <Label>Adicionar Item à Venda</Label>
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        placeholder="Ex: 3 cimento ou cimento"
                        className="pl-10"
                      />
                    </div>
                    {/* Resultados da busca */}
                    {filteredProducts.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-1 border border-border rounded-md bg-background shadow-lg max-h-48 overflow-y-auto">
                        {filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => addItem(product, parsedQty)}
                            className="w-full flex items-center justify-between p-3 hover:bg-muted/10 transition-colors text-left border-b border-border last:border-b-0"
                          >
                            <div>
                              <p className="text-sm font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                SKU: {product.sku} • Estoque: {product.stock} {product.unit}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(product.price)}
                              </p>
                              <p className="text-xs text-muted-foreground">/{product.unit}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Lista de itens */}
                {items.length > 0 ? (
                  <div className="border border-border rounded-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/10">
                          <tr className="h-8">
                            <th className="text-left text-xs font-medium text-muted-foreground px-3 py-0 align-middle">
                              Produto
                            </th>
                            <th className="text-center text-xs font-medium text-muted-foreground px-3 py-0 align-middle w-32">
                              Qtd
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground px-3 py-0 align-middle w-32">
                              Unitário
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground px-3 py-0 align-middle w-24">
                              Desc %
                            </th>
                            <th className="text-right text-xs font-medium text-muted-foreground px-3 py-0 align-middle w-32">
                              Total
                            </th>
                            <th className="w-10 px-3 py-0 align-middle"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, index) => (
                            <tr
                              key={item.id}
                              className={cn(
                                "border-t border-border",
                                index % 2 === 0 ? "bg-background" : "bg-muted/20"
                              )}
                            >
                              <td className="p-3">
                                <p className="text-sm font-medium">{item.name}</p>
                                <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center justify-center">
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      updateItemQuantity(
                                        item.id,
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    className="w-20 h-7 text-center text-sm px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    min="1"
                                  />
                                </div>
                              </td>
                              <td className="p-3">
                                <Input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) =>
                                    updateItemPrice(item.id, parseFloat(e.target.value) || 0)
                                  }
                                  className="text-right text-sm h-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  step="0.01"
                                />
                              </td>
                              <td className="p-3">
                                <Input
                                  type="number"
                                  value={item.discount}
                                  onChange={(e) =>
                                    updateItemDiscount(
                                      item.id,
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="text-right text-sm h-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  step="0.01"
                                  min="0"
                                  max="100"
                                />
                              </td>
                              <td className="p-3 text-right text-sm font-medium">
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(item.totalPrice)}
                              </td>
                              <td className="p-3">
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.id)}
                                  className="text-destructive hover:text-destructive/80"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-md">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Nenhum item adicionado à venda</p>
                    <p className="text-xs mt-1">Busque e adicione produtos acima</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Totais e Pagamento */}
        {activeTab === "totais" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="h-8 px-4 py-0 flex items-center border-b border-border/60">
                <CardTitle className="text-base">Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 rounded-lg bg-muted/10 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(getSubtotal())}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountPercent">Desconto Geral (%)</Label>
                    <Input
                      id="discountPercent"
                      type="number"
                      value={formData.discountPercent}
                      onChange={(e) =>
                        handleInputChange("discountPercent", parseFloat(e.target.value) || 0)
                      }
                      step="0.01"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-sm text-muted-foreground">Total em Descontos:</span>
                    <span className="font-medium text-orange-600">
                      -{" "}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(getTotalDiscount())}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-base font-medium">Valor Final:</span>
                    <span className="text-lg font-bold text-primary">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(getFinalValue())}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3 [&_input]:h-8 [&_button[role='combobox']]:h-8">
              <Card>
                <CardHeader className="h-8 px-4 py-0 flex items-center border-b border-border/60">
                  <CardTitle className="text-base">Informações de Pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Forma de Pagamento *</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) => handleInputChange("paymentMethod", value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                        <SelectItem value="boleto">Boleto Bancário</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Prazo de Pagamento</Label>
                    <Select
                      value={formData.paymentTerm}
                      onValueChange={(value) => handleInputChange("paymentTerm", value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="avista">À Vista</SelectItem>
                        <SelectItem value="7dias">7 dias</SelectItem>
                        <SelectItem value="15dias">15 dias</SelectItem>
                        <SelectItem value="30dias">30 dias</SelectItem>
                        <SelectItem value="30-60">30/60 dias</SelectItem>
                        <SelectItem value="30-60-90">30/60/90 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status do Pagamento</Label>
                    <Select
                      value={formData.paymentStatus}
                      onValueChange={(value) => handleInputChange("paymentStatus", value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="partial">Parcial</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Entrega e Observações */}
        {activeTab === "entrega" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="h-8 px-4 py-0 flex items-center border-b border-border/60">
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Informações de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress">Endereço de Entrega</Label>
                  <Input
                    id="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={(e) => handleInputChange("deliveryAddress", e.target.value)}
                    placeholder="Rua, número, complemento"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryCity">Cidade</Label>
                    <Input
                      id="deliveryCity"
                      value={formData.deliveryCity}
                      onChange={(e) => handleInputChange("deliveryCity", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryState">Estado</Label>
                    <Select
                      value={formData.deliveryState}
                      onValueChange={(value) => handleInputChange("deliveryState", value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SP">SP</SelectItem>
                        <SelectItem value="RJ">RJ</SelectItem>
                        <SelectItem value="MG">MG</SelectItem>
                        <SelectItem value="RS">RS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryZipCode">CEP</Label>
                    <Input
                      id="deliveryZipCode"
                      value={formData.deliveryZipCode}
                      onChange={(e) => handleInputChange("deliveryZipCode", e.target.value)}
                      placeholder="00000-000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryDate">Data de Entrega</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => handleInputChange("deliveryDate", e.target.value)}
                    />
                  </div>
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
                  placeholder="Informações adicionais sobre a venda, entrega, condições especiais..."
                  rows={12}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
















