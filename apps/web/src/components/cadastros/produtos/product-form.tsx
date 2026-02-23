"use client"

import React from "react"

import { useState } from "react"
import {
  Save,
  Trash2,
  Upload,
  Package,
  Info,
  DollarSign,
  Layers,
  Store,
  FileText,
  ImageIcon,
  Search,
  Boxes,
  X,
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
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useCreateProduto, useUpdateProduto } from "@/hooks/use-produtos"

interface Product {
  id: string
  sku: string
  name: string
  category: string
  brand: string
  price: number
  cost: number
  stock: number
  status: "active" | "inactive" | "out_of_stock"
  ean: string
  image?: string
}

interface ProductFormProps {
  product?: Product | null
  onClose: () => void
  viewMode?: "new" | "edit" | "view"
}

type TabType = "geral" | "precos" | "estoque" | "composicao" | "fiscal" | "ecommerce" | "imagens"

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "geral", label: "Dados Gerais", icon: Info },
  { id: "precos", label: "Preços", icon: DollarSign },
  { id: "estoque", label: "Estoque", icon: Layers },
  { id: "composicao", label: "Composição", icon: Boxes },
  { id: "fiscal", label: "Fiscal", icon: FileText },
  { id: "ecommerce", label: "E-commerce", icon: Store },
  { id: "imagens", label: "Imagens", icon: ImageIcon },
]

// Mock de produtos disponíveis para composição do kit
const availableProducts = [
  { id: "1", sku: "DRY-001", name: "Placa Drywall ST 12.5mm", price: 45.90, unit: "UN" },
  { id: "2", sku: "DRY-002", name: "Placa Drywall RU 12.5mm", price: 52.90, unit: "UN" },
  { id: "3", sku: "PER-001", name: "Perfil Montante 48mm", price: 18.50, unit: "UN" },
  { id: "4", sku: "PER-002", name: "Perfil Guia 48mm", price: 15.90, unit: "UN" },
  { id: "5", sku: "PAR-001", name: "Parafuso Cabeça Trombeta", price: 0.15, unit: "UN" },
  { id: "6", sku: "FIT-001", name: "Fita de Papel Microperfurada", price: 28.90, unit: "RL" },
  { id: "7", sku: "MAS-001", name: "Massa para Juntas 25kg", price: 89.90, unit: "UN" },
]

interface KitItem {
  id: string
  productId: string
  sku: string
  name: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
}

export function ProductForm({ product, onClose, viewMode = "new" }: ProductFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>("geral")
  const [isSaving, setIsSaving] = useState(false)
  const isViewOnly = viewMode === "view"
  const [isKit, setIsKit] = useState(false)
  const [kitItems, setKitItems] = useState<KitItem[]>([])
  const [kitSearchTerm, setKitSearchTerm] = useState("")
  
  const createProduto = useCreateProduto()
  const updateProduto = useUpdateProduto()
  
  const [formData, setFormData] = useState({
    // Dados Gerais
    name: product?.name || "",
    sku: product?.sku || "",
    ean: product?.ean || "",
    ncm: "",
    cest: "",
    category: product?.category || "",
    subcategory: "",
    brand: product?.brand || "",
    unit: "UN",
    status: product?.status || "active",
    description: "",
    shortDescription: "",
    // Preços
    costPrice: product?.cost || 0,
    salePrice: product?.price || 0,
    promotionalPrice: 0,
    profitMargin: 0,
    // Estoque
    currentStock: product?.stock || 0,
    minStock: 0,
    maxStock: 0,
    stockLocation: "",
    // Peso e Dimensões
    weight: 0,
    height: 0,
    width: 0,
    length: 0,
    // Fiscal
    origin: "0",
    cfop: "",
    cst: "",
    icms: 0,
    ipi: 0,
    pis: 0,
    cofins: 0,
    // E-commerce
    publishOnline: true,
    metaTitle: "",
    metaDescription: "",
    slug: "",
    tags: "",
    // Variações
    hasVariations: false,
  })

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!formData.name) { toast.error("Nome do produto é obrigatório"); return }
    if (!formData.salePrice) { toast.error("Preço de venda é obrigatório"); return }

    const payload: Record<string, unknown> = {
      name: formData.name,
      sku: formData.sku || undefined,
      ean: formData.ean || undefined,
      category: formData.category || undefined,
      brand: formData.brand || undefined,
      price: formData.salePrice,
      cost: formData.costPrice || undefined,
      stock: formData.currentStock || 0,
      status: formData.status,
    }

    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) delete payload[key]
    })

    setIsSaving(true)
    try {
      if (viewMode === "edit" && product?.id) {
        await updateProduto.mutateAsync({ id: product.id, data: payload })
      } else {
        await createProduto.mutateAsync(payload as any)
      }
      onClose()
    } catch (error) {
      console.error("Erro ao salvar produto:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Funções para gerenciar itens do kit
  const addKitItem = (product: typeof availableProducts[0]) => {
    const existingItem = kitItems.find((item) => item.productId === product.id)
    if (existingItem) {
      updateKitItemQuantity(existingItem.id, existingItem.quantity + 1)
    } else {
      const newItem: KitItem = {
        id: Date.now().toString(),
        productId: product.id,
        sku: product.sku,
        name: product.name,
        quantity: 1,
        unit: product.unit,
        unitPrice: product.price,
        totalPrice: product.price,
      }
      setKitItems((prev) => [...prev, newItem])
    }
    setKitSearchTerm("")
  }

  const updateKitItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeKitItem(itemId)
      return
    }
    setKitItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
          : item
      )
    )
  }

  const removeKitItem = (itemId: string) => {
    setKitItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const getKitTotalCost = () => {
    return kitItems.reduce((sum, item) => sum + item.totalPrice, 0)
  }

    const filteredAvailableProducts = availableProducts.filter(
    (p) =>
      kitSearchTerm &&
      (p.name.toLowerCase().includes(kitSearchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(kitSearchTerm.toLowerCase()))
  )

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
              <CardHeader>
                <CardTitle className="text-base">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ex: Placa Drywall ST 12.5mm"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange("sku", e.target.value)}
                      placeholder="Ex: DRY-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ean">EAN/GTIN</Label>
                    <Input
                      id="ean"
                      value={formData.ean}
                      onChange={(e) => handleInputChange("ean", e.target.value)}
                      placeholder="Ex: 7891234567890"
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ncm">NCM</Label>
                    <Input
                      id="ncm"
                      value={formData.ncm}
                      onChange={(e) => handleInputChange("ncm", e.target.value)}
                      placeholder="Ex: 6809.11.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cest">CEST</Label>
                    <Input
                      id="cest"
                      value={formData.cest}
                      onChange={(e) => handleInputChange("cest", e.target.value)}
                      placeholder="Ex: 10.001.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição Completa</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Descrição detalhada do produto..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Descrição Curta</Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                    placeholder="Descrição resumida para listagens..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3 [&_input]:h-8 [&_button[role='combobox']]:h-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Classificação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Categoria *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="drywall">Drywall</SelectItem>
                        <SelectItem value="steel_frame">Steel Frame</SelectItem>
                        <SelectItem value="acessorios">Acessórios</SelectItem>
                        <SelectItem value="ferramentas">Ferramentas</SelectItem>
                        <SelectItem value="forros">Forros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subcategoria</Label>
                    <Select
                      value={formData.subcategory}
                      onValueChange={(value) => handleInputChange("subcategory", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma subcategoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placas">Placas</SelectItem>
                        <SelectItem value="perfis">Perfis</SelectItem>
                        <SelectItem value="massas">Massas</SelectItem>
                        <SelectItem value="fitas">Fitas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Marca</Label>
                    <Select
                      value={formData.brand}
                      onValueChange={(value) => handleInputChange("brand", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma marca" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placo">Placo</SelectItem>
                        <SelectItem value="gypsum">Gypsum</SelectItem>
                        <SelectItem value="knauf">Knauf</SelectItem>
                        <SelectItem value="lafarge">Lafarge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Unidade de Medida</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => handleInputChange("unit", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UN">Unidade (UN)</SelectItem>
                        <SelectItem value="KG">Quilograma (KG)</SelectItem>
                        <SelectItem value="MT">Metro (MT)</SelectItem>
                        <SelectItem value="M2">Metro² (M²)</SelectItem>
                        <SelectItem value="CX">Caixa (CX)</SelectItem>
                        <SelectItem value="PCT">Pacote (PCT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Situação do Produto</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="out_of_stock">Sem Estoque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Produto com Variações</Label>
                      <p className="text-xs text-muted-foreground">
                        Habilite para produtos com cor, tamanho, etc.
                      </p>
                    </div>
                    <Switch
                      checked={formData.hasVariations}
                      onCheckedChange={(checked) => handleInputChange("hasVariations", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Produto Kit</Label>
                      <p className="text-xs text-muted-foreground">
                        Habilite para criar um kit com outros produtos
                      </p>
                    </div>
                    <Switch
                      checked={isKit}
                      onCheckedChange={setIsKit}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Preços */}
        {activeTab === "precos" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preços</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Preço de Custo *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      R$
                    </span>
                    <Input
                      id="costPrice"
                      type="number"
                      value={formData.costPrice}
                      onChange={(e) => handleInputChange("costPrice", parseFloat(e.target.value) || 0)}
                      className="pl-10"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Preço de Venda *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      R$
                    </span>
                    <Input
                      id="salePrice"
                      type="number"
                      value={formData.salePrice}
                      onChange={(e) => handleInputChange("salePrice", parseFloat(e.target.value) || 0)}
                      className="pl-10"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promotionalPrice">Preço Promocional</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      R$
                    </span>
                    <Input
                      id="promotionalPrice"
                      type="number"
                      value={formData.promotionalPrice}
                      onChange={(e) => handleInputChange("promotionalPrice", parseFloat(e.target.value) || 0)}
                      className="pl-10"
                      step="0.01"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Margem de Lucro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 rounded-lg bg-muted/10 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Custo:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(formData.costPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Venda:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(formData.salePrice)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="text-sm text-muted-foreground">Lucro:</span>
                    <span className="font-medium text-green-600">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(formData.salePrice - formData.costPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Margem:</span>
                    <span className="font-medium text-green-600">
                      {formData.costPrice > 0
                        ? (((formData.salePrice - formData.costPrice) / formData.costPrice) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Estoque */}
        {activeTab === "estoque" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Controle de Estoque</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="currentStock">Estoque Atual</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => handleInputChange("currentStock", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="minStock">Estoque Mínimo</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => handleInputChange("minStock", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStock">Estoque Máximo</Label>
                    <Input
                      id="maxStock"
                      type="number"
                      value={formData.maxStock}
                      onChange={(e) => handleInputChange("maxStock", parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockLocation">Localização no Estoque</Label>
                  <Input
                    id="stockLocation"
                    value={formData.stockLocation}
                    onChange={(e) => handleInputChange("stockLocation", e.target.value)}
                    placeholder="Ex: Corredor A, Prateleira 3"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Peso e Dimensões</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", parseFloat(e.target.value) || 0)}
                    step="0.001"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) => handleInputChange("height", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width">Largura (cm)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={formData.width}
                      onChange={(e) => handleInputChange("width", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="length">Comprimento (cm)</Label>
                    <Input
                      id="length"
                      type="number"
                      value={formData.length}
                      onChange={(e) => handleInputChange("length", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Essas informações são essenciais para cálculo de frete em e-commerce e marketplaces.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Composição (Kit) */}
        {activeTab === "composicao" && (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Boxes className="h-4 w-4" />
                  Composição do Kit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!isKit ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Boxes className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Este produto não é um kit.</p>
                    <p className="text-xs mt-1">
                      Ative a opção "Produto Kit" na aba Dados Gerais para adicionar itens.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Busca de produtos */}
                    <div className="space-y-2">
                      <Label>Adicionar Produto ao Kit</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={kitSearchTerm}
                          onChange={(e) => setKitSearchTerm(e.target.value)}
                          placeholder="Buscar por nome ou SKU..."
                          className="pl-10"
                        />
                      </div>
                      {/* Resultados da busca */}
                      {filteredAvailableProducts.length > 0 && (
                        <div className="border border-border rounded-md max-h-48 overflow-y-auto">
                          {filteredAvailableProducts.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => addKitItem(product)}
                              className="w-full flex items-center justify-between p-3 hover:bg-muted/10 transition-colors text-left border-b border-border last:border-b-0"
                            >
                              <div>
                                <p className="text-sm font-medium">{product.name}</p>
                                <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}
                                </p>
                                <p className="text-xs text-muted-foreground">/{product.unit}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Lista de itens do kit */}
                    {kitItems.length > 0 ? (
                      <div className="border border-border rounded-md overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted/10">
                            <tr>
                              <th className="text-left text-xs font-medium text-muted-foreground p-3">Produto</th>
                              <th className="text-center text-xs font-medium text-muted-foreground p-3 w-24">Qtd</th>
                              <th className="text-right text-xs font-medium text-muted-foreground p-3 w-28">Unitário</th>
                              <th className="text-right text-xs font-medium text-muted-foreground p-3 w-28">Total</th>
                              <th className="w-10 p-3"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {kitItems.map((item) => (
                              <tr key={item.id} className="border-t border-border">
                                <td className="p-3">
                                  <p className="text-sm font-medium">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => updateKitItemQuantity(item.id, item.quantity - 1)}
                                      className="h-6 w-6 rounded border border-border flex items-center justify-center hover:bg-muted"
                                    >
                                      -
                                    </button>
                                    <Input
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) => updateKitItemQuantity(item.id, parseInt(e.target.value) || 0)}
                                      className="w-14 h-6 text-center text-sm px-1"
                                      min="1"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => updateKitItemQuantity(item.id, item.quantity + 1)}
                                      className="h-6 w-6 rounded border border-border flex items-center justify-center hover:bg-muted"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                                <td className="p-3 text-right text-sm">
                                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.unitPrice)}
                                </td>
                                <td className="p-3 text-right text-sm font-medium">
                                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.totalPrice)}
                                </td>
                                <td className="p-3">
                                  <button
                                    type="button"
                                    onClick={() => removeKitItem(item.id)}
                                    className="text-destructive hover:text-destructive/80"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-muted/10">
                            <tr className="border-t border-border">
                              <td colSpan={3} className="p-3 text-right text-sm font-medium">
                                Custo Total do Kit:
                              </td>
                              <td className="p-3 text-right text-sm font-bold text-primary">
                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(getKitTotalCost())}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-md">
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum produto adicionado ao kit</p>
                        <p className="text-xs mt-1">Busque e adicione produtos acima</p>
                      </div>
                    )}

                    {/* Resumo */}
                    {kitItems.length > 0 && (
                      <div className="p-4 rounded-lg bg-muted/10 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total de itens:</span>
                          <span className="font-medium">{kitItems.length} produto(s)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Quantidade total:</span>
                          <span className="font-medium">{kitItems.reduce((sum, item) => sum + item.quantity, 0)} unidade(s)</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-border">
                          <span className="text-muted-foreground">Custo do Kit:</span>
                          <span className="font-bold text-primary">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(getKitTotalCost())}
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

        {/* Fiscal */}
        {activeTab === "fiscal" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dados Fiscais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Origem do Produto</Label>
                  <Select
                    value={formData.origin}
                    onValueChange={(value) => handleInputChange("origin", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 - Nacional</SelectItem>
                      <SelectItem value="1">1 - Estrangeira (Importação direta)</SelectItem>
                      <SelectItem value="2">2 - Estrangeira (Adquirida no mercado interno)</SelectItem>
                      <SelectItem value="3">3 - Nacional com mais de 40% de conteúdo estrangeiro</SelectItem>
                      <SelectItem value="4">4 - Nacional (PPB)</SelectItem>
                      <SelectItem value="5">5 - Nacional com menos de 40% de conteúdo estrangeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cfop">CFOP Padrão</Label>
                    <Input
                      id="cfop"
                      value={formData.cfop}
                      onChange={(e) => handleInputChange("cfop", e.target.value)}
                      placeholder="Ex: 5102"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cst">CST</Label>
                    <Input
                      id="cst"
                      value={formData.cst}
                      onChange={(e) => handleInputChange("cst", e.target.value)}
                      placeholder="Ex: 00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Alíquotas de Impostos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="icms">ICMS (%)</Label>
                    <Input
                      id="icms"
                      type="number"
                      value={formData.icms}
                      onChange={(e) => handleInputChange("icms", parseFloat(e.target.value) || 0)}
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ipi">IPI (%)</Label>
                    <Input
                      id="ipi"
                      type="number"
                      value={formData.ipi}
                      onChange={(e) => handleInputChange("ipi", parseFloat(e.target.value) || 0)}
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pis">PIS (%)</Label>
                    <Input
                      id="pis"
                      type="number"
                      value={formData.pis}
                      onChange={(e) => handleInputChange("pis", parseFloat(e.target.value) || 0)}
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cofins">COFINS (%)</Label>
                    <Input
                      id="cofins"
                      type="number"
                      value={formData.cofins}
                      onChange={(e) => handleInputChange("cofins", parseFloat(e.target.value) || 0)}
                      step="0.01"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* E-commerce */}
        {activeTab === "ecommerce" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Publicação Online</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Publicar na Loja Virtual</Label>
                    <p className="text-xs text-muted-foreground">
                      Exibir este produto na loja online
                    </p>
                  </div>
                  <Switch
                    checked={formData.publishOnline}
                    onCheckedChange={(checked) => handleInputChange("publishOnline", checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Amigável (Slug)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    placeholder="Ex: placa-drywall-st-12-5mm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                    placeholder="Ex: drywall, placa, gesso, construção"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">SEO - Otimização para Buscadores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Título SEO</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => handleInputChange("metaTitle", e.target.value)}
                    placeholder="Título otimizado para buscadores"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.metaTitle.length}/60 caracteres
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Descrição SEO</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => handleInputChange("metaDescription", e.target.value)}
                    placeholder="Descrição otimizada para buscadores"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.metaDescription.length}/160 caracteres
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Canais de Venda (Marketplaces)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {["Mercado Livre", "Amazon", "Shopee", "Magazine Luiza"].map((marketplace) => (
                    <div
                      key={marketplace}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <span className="text-sm font-medium">{marketplace}</span>
                      <Switch />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Imagens */}
        {activeTab === "imagens" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Imagens do Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* Upload Area */}
                <div className="aspect-square rounded-lg border-2 border-dashed border-border bg-muted/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/10 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Clique para enviar</span>
                  <span className="text-xs text-muted-foreground">ou arraste uma imagem</span>
                </div>

                {/* Placeholder Images */}
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg border border-border bg-muted/10 flex items-center justify-center relative group"
                  >
                    <Package className="h-12 w-12 text-muted-foreground/30" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                      <Button size="icon" variant="secondary" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Formatos aceitos: JPG, PNG, WebP. Tamanho máximo: 5MB. Resolução mínima recomendada: 1000x1000px.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}






























