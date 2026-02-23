"use client"

import { useState } from "react"
import { Save, Building2, MapPin, CreditCard, Package, Truck, X } from "lucide-react"
import { useCNPJLookup } from "@/hooks/useCNPJLookup"
import { InputCNPJ } from "@/components/ui/input-cnpj"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { useCreateFornecedor, useUpdateFornecedor } from "@/hooks/use-fornecedores"

interface SupplierFormProps {
  supplier?: any
  onClose: () => void
  viewMode?: "new" | "edit" | "view"
}

export function SupplierForm({ supplier, onClose, viewMode = "new" }: SupplierFormProps) {
  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)
  const isViewOnly = viewMode === "view"
  const isEditing = viewMode === "edit"

  // Hooks de mutação (API real)
  const createFornecedor = useCreateFornecedor()
  const updateFornecedor = useUpdateFornecedor()

  // Estado para o CNPJ
  const [cnpjValue, setCnpjValue] = useState(supplier?.document || "")

  // Hook para buscar dados do CNPJ na Nuvem Fiscal
  const { buscar, isLoading } = useCNPJLookup({
    onSuccess: (data) => {
      // Auto-preenche os campos do formulário com os dados da Receita Federal
      const razaoSocialInput = document.getElementById("name") as HTMLInputElement
      const nomeFantasiaInput = document.getElementById("tradeName") as HTMLInputElement
      const ieInput = document.getElementById("stateRegistration") as HTMLInputElement
      const imInput = document.getElementById("municipalRegistration") as HTMLInputElement

      // Endereço
      const cepInput = document.getElementById("zipCode") as HTMLInputElement
      const logradouroInput = document.getElementById("street") as HTMLInputElement
      const numeroInput = document.getElementById("number") as HTMLInputElement
      const complementoInput = document.getElementById("complement") as HTMLInputElement
      const bairroInput = document.getElementById("neighborhood") as HTMLInputElement
      const cidadeInput = document.getElementById("city") as HTMLInputElement

      if (razaoSocialInput) razaoSocialInput.value = data.razao_social || ""
      if (nomeFantasiaInput) nomeFantasiaInput.value = data.nome_fantasia || ""
      if (ieInput) ieInput.value = data.inscricao_estadual || ""
      if (imInput) imInput.value = data.inscricao_municipal || ""

      // Preenche endereço
      if (data.endereco) {
        if (cepInput) cepInput.value = data.endereco.cep || ""
        if (logradouroInput) {
          const logradouroCompleto = data.endereco.tipo_logradouro
            ? `${data.endereco.tipo_logradouro} ${data.endereco.logradouro}`
            : data.endereco.logradouro
          logradouroInput.value = logradouroCompleto || ""
        }
        if (numeroInput) numeroInput.value = data.endereco.numero || ""
        if (complementoInput) complementoInput.value = data.endereco.complemento || ""
        if (bairroInput) bairroInput.value = data.endereco.bairro || ""
        if (cidadeInput) cidadeInput.value = data.endereco.municipio || ""
      }

      // Muda para a aba de endereço para o usuário ver os dados preenchidos
      setActiveTab("address")
    }
  })

  const handleSave = async () => {
    const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || ""
    
    const name = getVal("name")
    if (!name) { toast.error("Razão Social é obrigatória"); return }
    if (!cnpjValue) { toast.error("CNPJ é obrigatório"); return }
    
    const email = getVal("email")
    if (!email) { toast.error("E-mail é obrigatório"); return }
    
    const phone = getVal("phone")
    if (!phone) { toast.error("Telefone é obrigatório"); return }

    const payload: Record<string, unknown> = {
      name,
      tradeName: getVal("tradeName") || undefined,
      type: "pj" as const,
      document: cnpjValue,
      stateRegistration: getVal("stateRegistration") || undefined,
      email,
      phone,
      cellphone: getVal("cellphone") || undefined,
      zipCode: getVal("zipCode") || undefined,
      address: getVal("street") || undefined,
      number: getVal("number") || undefined,
      complement: getVal("complement") || undefined,
      neighborhood: getVal("neighborhood") || undefined,
      city: getVal("city") || supplier?.city || "N/A",
      state: supplier?.state || "XX",
      paymentTerms: getVal("paymentTerms") || undefined,
      notes: getVal("notes") || undefined,
    }

    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) delete payload[key]
    })

    setIsSaving(true)
    try {
      if (isEditing && supplier?.id) {
        await updateFornecedor.mutateAsync({ id: supplier.id, data: payload })
      } else {
        await createFornecedor.mutateAsync(payload as any)
      }
      onClose()
    } catch (error: any) {
      console.error("Erro ao salvar fornecedor:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-3 [&_input]:h-8 [&_button[role='combobox']]:h-8">
      {/* Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-end justify-between gap-3">
          <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="gap-2">
            <Building2 className="h-4 w-4" />
            Dados Gerais
          </TabsTrigger>
          <TabsTrigger value="address" className="gap-2">
            <MapPin className="h-4 w-4" />
            Endereço
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="delivery" className="gap-2">
            <Truck className="h-4 w-4" />
            Entrega
          </TabsTrigger>
          </TabsList>
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

        {/* General Tab */}
        <TabsContent value="general" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Identificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="code">Código</Label>
                  <Input id="code" placeholder="Automático" disabled />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name">Razão Social *</Label>
                  <Input
                    id="name"
                    placeholder="Razão social da empresa"
                    defaultValue={supplier?.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document">CNPJ *</Label>
                  <InputCNPJ
                    id="document"
                    value={cnpjValue}
                    onChange={setCnpjValue}
                    onSearch={() => buscar(cnpjValue)}
                    isLoading={isLoading}
                    showValidation={true}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="tradeName">Nome Fantasia</Label>
                  <Input
                    id="tradeName"
                    placeholder="Nome fantasia"
                    defaultValue={supplier?.tradeName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stateRegistration">Inscrição Estadual</Label>
                  <Input id="stateRegistration" placeholder="Inscrição estadual" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="municipalRegistration">Inscrição Municipal</Label>
                  <Input id="municipalRegistration" placeholder="Inscrição municipal" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    defaultValue={supplier?.email}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(00) 0000-0000"
                    defaultValue={supplier?.phone}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cellphone">Celular</Label>
                  <Input id="cellphone" placeholder="(00) 00000-0000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Nome do Contato / Representante</Label>
                  <Input id="contactName" placeholder="Nome da pessoa de contato" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" placeholder="www.exemplo.com.br" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Classificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria Principal</Label>
                  <Select defaultValue={supplier?.category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Drywall">Drywall</SelectItem>
                      <SelectItem value="Steel Frame">Steel Frame</SelectItem>
                      <SelectItem value="Ferramentas">Ferramentas</SelectItem>
                      <SelectItem value="Acessórios">Acessórios</SelectItem>
                      <SelectItem value="Diversos">Diversos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplierType">Tipo de Fornecedor</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manufacturer">Fabricante</SelectItem>
                      <SelectItem value="distributor">Distribuidor</SelectItem>
                      <SelectItem value="importer">Importador</SelectItem>
                      <SelectItem value="representative">Representante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Observações gerais sobre o fornecedor..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Address Tab */}
        <TabsContent value="address" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Endereço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP *</Label>
                  <Input id="zipCode" placeholder="00000-000" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="street">Logradouro *</Label>
                  <Input id="street" placeholder="Rua, Avenida, etc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Número *</Label>
                  <Input id="number" placeholder="Nº" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input id="complement" placeholder="Apto, Sala, etc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input id="neighborhood" placeholder="Bairro" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Referência</Label>
                  <Input id="reference" placeholder="Ponto de referência" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input id="city" placeholder="Cidade" defaultValue={supplier?.city} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">UF *</Label>
                  <Select defaultValue={supplier?.state}>
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">AC</SelectItem>
                      <SelectItem value="AL">AL</SelectItem>
                      <SelectItem value="AP">AP</SelectItem>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="BA">BA</SelectItem>
                      <SelectItem value="CE">CE</SelectItem>
                      <SelectItem value="DF">DF</SelectItem>
                      <SelectItem value="ES">ES</SelectItem>
                      <SelectItem value="GO">GO</SelectItem>
                      <SelectItem value="MA">MA</SelectItem>
                      <SelectItem value="MT">MT</SelectItem>
                      <SelectItem value="MS">MS</SelectItem>
                      <SelectItem value="MG">MG</SelectItem>
                      <SelectItem value="PA">PA</SelectItem>
                      <SelectItem value="PB">PB</SelectItem>
                      <SelectItem value="PR">PR</SelectItem>
                      <SelectItem value="PE">PE</SelectItem>
                      <SelectItem value="PI">PI</SelectItem>
                      <SelectItem value="RJ">RJ</SelectItem>
                      <SelectItem value="RN">RN</SelectItem>
                      <SelectItem value="RS">RS</SelectItem>
                      <SelectItem value="RO">RO</SelectItem>
                      <SelectItem value="RR">RR</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                      <SelectItem value="SP">SP</SelectItem>
                      <SelectItem value="SE">SE</SelectItem>
                      <SelectItem value="TO">TO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Condições Comerciais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="paymentCondition">Condição de Pagamento Padrão</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">À Vista</SelectItem>
                      <SelectItem value="7d">7 dias</SelectItem>
                      <SelectItem value="14d">14 dias</SelectItem>
                      <SelectItem value="21d">21 dias</SelectItem>
                      <SelectItem value="28d">28 dias</SelectItem>
                      <SelectItem value="30d">30 dias</SelectItem>
                      <SelectItem value="30-60">30/60 dias</SelectItem>
                      <SelectItem value="30-60-90">30/60/90 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Forma de Pagamento Padrão</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="transfer">Transferência</SelectItem>
                      <SelectItem value="check">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumOrder">Pedido Mínimo</Label>
                  <Input id="minimumOrder" placeholder="R$ 0,00" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="discount">Desconto Padrão (%)</Label>
                  <Input id="discount" placeholder="0,00%" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditLimit">Limite de Crédito</Label>
                  <Input id="creditLimit" placeholder="R$ 0,00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentBalance">Saldo Atual</Label>
                  <Input
                    id="currentBalance"
                    placeholder="R$ 0,00"
                    disabled
                    defaultValue={supplier?.balance}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados Bancários do Fornecedor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="bank">Banco</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="001">001 - Banco do Brasil</SelectItem>
                      <SelectItem value="033">033 - Santander</SelectItem>
                      <SelectItem value="104">104 - Caixa</SelectItem>
                      <SelectItem value="237">237 - Bradesco</SelectItem>
                      <SelectItem value="341">341 - Itaú</SelectItem>
                      <SelectItem value="756">756 - Sicoob</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency">Agência</Label>
                  <Input id="agency" placeholder="0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Conta</Label>
                  <Input id="account" placeholder="00000-0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pixKey">Chave PIX</Label>
                  <Input id="pixKey" placeholder="CNPJ, e-mail ou celular" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Produtos Fornecidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>Nenhum produto vinculado a este fornecedor.</p>
                <p className="text-sm">
                  Vincule produtos na tela de cadastro de produtos.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurações de Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="deliveryDays">Prazo de Entrega (dias)</Label>
                  <Input
                    id="deliveryDays"
                    type="number"
                    placeholder="0"
                    defaultValue={supplier?.deliveryDays}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freightType">Tipo de Frete</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cif">CIF (Frete Incluso)</SelectItem>
                      <SelectItem value="fob">FOB (Frete por Conta)</SelectItem>
                      <SelectItem value="both">Negociável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carrier">Transportadora Padrão</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="own">Frota Própria</SelectItem>
                      <SelectItem value="1">Transportadora ABC</SelectItem>
                      <SelectItem value="2">Expresso Rápido</SelectItem>
                      <SelectItem value="3">Logística Sul</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch id="scheduledDelivery" />
                  <Label htmlFor="scheduledDelivery">Aceita Entrega Programada</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="partialDelivery" />
                  <Label htmlFor="partialDelivery">Aceita Entrega Parcial</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryNotes">Observações de Entrega</Label>
                <Textarea
                  id="deliveryNotes"
                  placeholder="Instruções especiais para recebimento..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}











