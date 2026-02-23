"use client"

import { useState } from "react"
import { Save, User, MapPin, CreditCard, FileText, Plus, Trash2, X } from "lucide-react"
import { useCNPJLookup } from "@/hooks/useCNPJLookup"
import { useCEPLookup } from "@/hooks/useCEPLookup"
import { InputDocumento } from "@/components/ui/input-documento"
import { InputPhone } from "@/components/ui/input-phone"
import { InputCEP } from "@/components/ui/input-cep"
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
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useCreateCliente, useUpdateCliente } from "@/hooks/use-clientes"

interface ClientFormProps {
  client?: any
  onClose: () => void
  viewMode?: "new" | "edit" | "view"
}

interface DeliveryAddress {
  id: string
  name: string
  zipCode: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  reference: string
}

export function ClientForm({ client, onClose, viewMode = "new" }: ClientFormProps) {
  const [activeTab, setActiveTab] = useState("general")
  const [billingAddressSame, setBillingAddressSame] = useState(true)
  const [deliveryAddresses, setDeliveryAddresses] = useState<DeliveryAddress[]>([
    { id: "1", name: "Endereço Padrão", zipCode: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "", reference: "" }
  ])
  const [deliveryAddressSame, setDeliveryAddressSame] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const isEditing = viewMode === "edit"
  const isViewOnly = viewMode === "view"

  // Hooks de mutação (API real)
  const createCliente = useCreateCliente()
  const updateCliente = useUpdateCliente()

  // Estados para campos com máscara
  const [documentValue, setDocumentValue] = useState(client?.document || "")
  const [documentType, setDocumentType] = useState<"cpf" | "cnpj" | null>(client?.type === "pf" ? "cpf" : client?.type === "pj" ? "cnpj" : null)
  const [phoneValue, setPhoneValue] = useState(client?.phone || "")
  const [cellphoneValue, setCellphoneValue] = useState(client?.cellphone || "")
  const [emailValue, setEmailValue] = useState(client?.email || "")
  const [emailError, setEmailError] = useState("")

  // Validação de e-mail
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError("E-mail é obrigatório")
      return false
    }
    if (!emailRegex.test(email)) {
      setEmailError("E-mail inválido")
      return false
    }
    setEmailError("")
    return true
  }

  // Hook para buscar dados do CNPJ na Nuvem Fiscal
  const { buscar, isLoading } = useCNPJLookup({
    onSuccess: (data) => {
      // Auto-preenche os campos do formulário com os dados da Receita Federal
      const razaoSocialInput = document.getElementById("name") as HTMLInputElement
      const nomeFantasiaInput = document.getElementById("tradeName") as HTMLInputElement
      const ieInput = document.getElementById("stateRegistration") as HTMLInputElement
      const imInput = document.getElementById("municipalRegistration") as HTMLInputElement

      // Endereço principal
      const cepInput = document.getElementById("main-zipCode") as HTMLInputElement
      const logradouroInput = document.getElementById("main-street") as HTMLInputElement
      const numeroInput = document.getElementById("main-number") as HTMLInputElement
      const complementoInput = document.getElementById("main-complement") as HTMLInputElement
      const bairroInput = document.getElementById("main-neighborhood") as HTMLInputElement
      const cidadeInput = document.getElementById("main-city") as HTMLInputElement

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

  // Hook para buscar CEP via ViaCEP
  const { buscar: buscarCEP, isLoading: isLoadingCEP } = useCEPLookup({
    onSuccess: (data) => {
      // Auto-preenche os campos de endereço
      const logradouroInput = document.getElementById("main-street") as HTMLInputElement
      const bairroInput = document.getElementById("main-neighborhood") as HTMLInputElement
      const cidadeInput = document.getElementById("main-city") as HTMLInputElement
      const ufSelect = document.getElementById("main-state") as HTMLSelectElement

      if (logradouroInput) logradouroInput.value = data.logradouro || ""
      if (bairroInput) bairroInput.value = data.bairro || ""
      if (cidadeInput) cidadeInput.value = data.localidade || ""
      if (ufSelect) ufSelect.value = data.uf || ""
    }
  })

  const addDeliveryAddress = () => {
    setDeliveryAddresses([
      ...deliveryAddresses,
      { 
        id: Date.now().toString(), 
        name: `Endereço ${deliveryAddresses.length + 1}`, 
        zipCode: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "", reference: "" 
      }
    ])
  }

  const removeDeliveryAddress = (id: string) => {
    if (deliveryAddresses.length > 1) {
      setDeliveryAddresses(deliveryAddresses.filter(addr => addr.id !== id))
    }
  }

  const handleSave = async () => {
    // Validação básica antes de salvar
    if (!validateEmail(emailValue)) {
      toast.error("Corrija os erros antes de salvar")
      return
    }

    if (!documentValue) {
      toast.error("CPF/CNPJ é obrigatório")
      return
    }

    if (!cellphoneValue) {
      toast.error("Celular é obrigatório")
      return
    }

    // Coletar dados do formulário
    const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || ""
    
    const payload: Record<string, unknown> = {
      name: getVal("name"),
      tradeName: getVal("tradeName") || undefined,
      type: documentType === "cpf" ? "pf" : "pj",
      document: documentValue,
      rg: getVal("rg") || undefined,
      stateRegistration: getVal("stateRegistration") || undefined,
      email: emailValue,
      phone: phoneValue,
      cellphone: cellphoneValue,
      zipCode: getVal("main-zipCode") || undefined,
      address: getVal("main-street") || undefined,
      number: getVal("main-number") || undefined,
      complement: getVal("main-complement") || undefined,
      neighborhood: getVal("main-neighborhood") || undefined,
      city: getVal("main-city") || client?.city || "",
      state: getVal("main-state") || client?.state || "",
      creditLimit: parseFloat(getVal("creditLimit")) || 0,
      notes: getVal("notes") || undefined,
    }

    // Remover campos undefined para não sobrescrever
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || payload[key] === "") delete payload[key]
    })

    // Garantir campos obrigatórios
    if (!payload.name) { toast.error("Nome/Razão Social é obrigatório"); return }
    if (!payload.city) { toast.error("Cidade é obrigatória"); return }
    if (!payload.state) { toast.error("Estado é obrigatório"); return }

    setIsSaving(true)

    try {
      if (isEditing && client?.id) {
        await updateCliente.mutateAsync({ id: client.id, data: payload })
      } else {
        await createCliente.mutateAsync(payload as any)
      }
      onClose()
    } catch (error: any) {
      console.error("Erro ao salvar cliente:", error)
      // toast já é disparado pelo hook
    } finally {
      setIsSaving(false)
    }
  }

  const AddressFields = ({ prefix, disabled = false }: { prefix: string; disabled?: boolean }) => {
    const [cepValue, setCepValue] = useState("")

    return (
        <div className="space-y-3 [&_input]:h-8 [&_button[role='combobox']]:h-8">
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-2">
            <Label htmlFor={`${prefix}-zipCode`}>CEP *</Label>
            <InputCEP
              id={`${prefix}-zipCode`}
              value={cepValue}
              onChange={setCepValue}
              onSearch={() => prefix === "main" && buscarCEP(cepValue)}
              isLoading={prefix === "main" && isLoadingCEP}
              disabled={disabled}
            />
          </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor={`${prefix}-street`}>Logradouro *</Label>
          <Input id={`${prefix}-street`} placeholder="Rua, Avenida, etc." disabled={disabled} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-number`}>Número *</Label>
          <Input id={`${prefix}-number`} placeholder="Nº" disabled={disabled} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-complement`}>Complemento</Label>
          <Input id={`${prefix}-complement`} placeholder="Apto, Sala, etc." disabled={disabled} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-neighborhood`}>Bairro *</Label>
          <Input id={`${prefix}-neighborhood`} placeholder="Bairro" disabled={disabled} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-reference`}>Referência</Label>
          <Input id={`${prefix}-reference`} placeholder="Ponto de referência" disabled={disabled} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-2">
          <Label htmlFor={`${prefix}-city`}>Cidade *</Label>
          <Input id={`${prefix}-city`} placeholder="Cidade" disabled={disabled} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-state`}>UF *</Label>
          <Select disabled={disabled}>
            <SelectTrigger className="h-8">
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
    </div>
  )}

  return (
    <div className="space-y-3 [&_input]:h-8 [&_button[role='combobox']]:h-8">
      {/* Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-end justify-between gap-3">
          <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="gap-2">
            <User className="h-4 w-4" />
            Dados Gerais
          </TabsTrigger>
          <TabsTrigger value="address" className="gap-2">
            <MapPin className="h-4 w-4" />
            Endereços
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="fiscal" className="gap-2">
            <FileText className="h-4 w-4" />
            Fiscal
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
        <TabsContent value="general" className="space-y-3 [&_input]:h-8 [&_button[role='combobox']]:h-8">
          <Card>
            <CardHeader className="border-b border-border/60">
              <CardTitle className="text-lg">Identificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 [&_input]:h-8 [&_button[role='combobox']]:h-8">
              {/* Linha 1: Código, Nome/Razão Social, Documento (CPF/CNPJ) */}
              <div className="grid grid-cols-6 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="code">Código</Label>
                  <Input id="code" placeholder="Auto" disabled />
                </div>
                <div className="col-span-3 space-y-2">
                  <Label htmlFor="name">
                    {documentType === "cnpj" ? "Razão Social *" : documentType === "cpf" ? "Nome Completo *" : "Nome/Razão Social *"}
                  </Label>
                  <Input
                    id="name"
                    placeholder={documentType === "cnpj" ? "Razão social da empresa" : "Nome completo"}
                    defaultValue={client?.name}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="document">CPF/CNPJ *</Label>
                  <InputDocumento
                    id="document"
                    value={documentValue}
                    onChange={(value, type) => {
                      setDocumentValue(value)
                      setDocumentType(type)
                    }}
                    onTypeDetected={setDocumentType}
                    onCNPJSearch={(cnpj) => buscar(cnpj)}
                    isSearching={isLoading}
                    showValidation={false}
                  />
                </div>
              </div>

              {/* Linha 2: Campos específicos por tipo de documento */}
              {documentType === "cnpj" && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="tradeName">Nome Fantasia</Label>
                    <Input
                      id="tradeName"
                      placeholder="Nome fantasia"
                      defaultValue={client?.tradeName}
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
              )}

              {documentType === "cpf" && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="rg">RG</Label>
                    <Input id="rg" placeholder="RG" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento</Label>
                    <Input id="birthDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Sexo</Label>
                    <Select>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Feminino</SelectItem>
                        <SelectItem value="O">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border/60">
              <CardTitle className="text-lg">Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 [&_input]:h-8 [&_button[role='combobox']]:h-8">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    onBlur={() => validateEmail(emailValue)}
                    className={cn(emailError && "border-red-500")}
                  />
                  {emailError && (
                    <p className="text-sm text-primary">{emailError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <InputPhone
                    id="phone"
                    value={phoneValue}
                    onChange={setPhoneValue}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cellphone">Celular *</Label>
                  <InputPhone
                    id="cellphone"
                    value={cellphoneValue}
                    onChange={setCellphoneValue}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Nome do Contato</Label>
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
            <CardHeader className="border-b border-border/60">
              <CardTitle className="text-lg">Classificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 [&_input]:h-8 [&_button[role='combobox']]:h-8">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="segment">Segmento</Label>
                  <Select>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="construction">Construção Civil</SelectItem>
                      <SelectItem value="retail">Varejo</SelectItem>
                      <SelectItem value="industry">Indústria</SelectItem>
                      <SelectItem value="services">Serviços</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seller">Vendedor</Label>
                  <Select>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Carlos Silva</SelectItem>
                      <SelectItem value="2">Maria Santos</SelectItem>
                      <SelectItem value="3">João Oliveira</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceTable">Tabela de Preço</Label>
                  <Select>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Padrão</SelectItem>
                      <SelectItem value="wholesale">Atacado</SelectItem>
                      <SelectItem value="retail">Varejo</SelectItem>
                      <SelectItem value="special">Especial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Observações gerais sobre o cliente..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Address Tab */}
        <TabsContent value="address" className="space-y-3 [&_input]:h-8 [&_button[role='combobox']]:h-8">
          {/* Endereço Principal */}
          <Card>
            <CardHeader className="border-b border-border/60">
              <CardTitle className="text-lg">Endereço Principal (Registro da Empresa)</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressFields prefix="main" />
            </CardContent>
          </Card>

          {/* Endereço de Cobrança */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Endereço de Cobrança</CardTitle>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="billingAddressSame" 
                  checked={billingAddressSame}
                  onCheckedChange={(checked) => setBillingAddressSame(checked as boolean)}
                />
                <Label htmlFor="billingAddressSame" className="text-sm font-normal cursor-pointer">
                  Mesmo do endereço principal
                </Label>
              </div>
            </CardHeader>
            {!billingAddressSame && (
              <CardContent className="pt-6">
                <AddressFields prefix="billing" />
              </CardContent>
            )}
          </Card>

          {/* Endereços de Entrega */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Endereços de Entrega</CardTitle>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="deliveryAddressSame" 
                    checked={deliveryAddressSame}
                    onCheckedChange={(checked) => setDeliveryAddressSame(checked as boolean)}
                  />
                  <Label htmlFor="deliveryAddressSame" className="text-sm font-normal cursor-pointer">
                    Mesmo do endereço principal
                  </Label>
                </div>
                {!deliveryAddressSame && (
                  <button
                    type="button"
                    onClick={addDeliveryAddress}
                    className="text-primary hover:text-primary/80 transition-colors"
                    title="Adicionar endereço de entrega"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                )}
              </div>
            </CardHeader>
            {!deliveryAddressSame && (
              <CardContent className="pt-6 space-y-3">
                {deliveryAddresses.map((addr, index) => (
                  <div key={addr.id} className="space-y-3 [&_input]:h-8 [&_button[role='combobox']]:h-8">
                    {index > 0 && <div className="border-t border-border/60 pt-6" />}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`delivery-name-${addr.id}`}>Nome do Endereço</Label>
                          <Input 
                            id={`delivery-name-${addr.id}`} 
                            placeholder="Ex: Matriz, Filial, Obra Centro..."
                            defaultValue={addr.name}
                            className="w-64"
                          />
                        </div>
                      </div>
                      {deliveryAddresses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDeliveryAddress(addr.id)}
                          className="text-destructive hover:text-destructive/80 transition-colors"
                          title="Remover endereço"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <AddressFields prefix={`delivery-${addr.id}`} />
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-3 [&_input]:h-8 [&_button[role='combobox']]:h-8">
          <Card>
            <CardHeader className="border-b border-border/60">
              <CardTitle className="text-lg">Crédito e Limites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 [&_input]:h-8 [&_button[role='combobox']]:h-8">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="creditLimit">Limite de Crédito</Label>
                  <Input
                    id="creditLimit"
                    placeholder="R$ 0,00"
                    defaultValue={client?.creditLimit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usedCredit">Crédito Utilizado</Label>
                  <Input id="usedCredit" placeholder="R$ 0,00" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availableCredit">Crédito Disponível</Label>
                  <Input id="availableCredit" placeholder="R$ 0,00" disabled />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="paymentCondition">Condição de Pagamento Padrão</Label>
                  <Select>
                    <SelectTrigger className="h-8">
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
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="card">Cartão</SelectItem>
                      <SelectItem value="transfer">Transferência</SelectItem>
                      <SelectItem value="check">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border/60">
              <CardTitle className="text-lg">Dados Bancários</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 [&_input]:h-8 [&_button[role='combobox']]:h-8">
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="bank">Banco</Label>
                  <Select>
                    <SelectTrigger className="h-8">
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
                  <Input id="pixKey" placeholder="CPF, CNPJ, e-mail ou celular" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fiscal Tab */}
        <TabsContent value="fiscal" className="space-y-3 [&_input]:h-8 [&_button[role='combobox']]:h-8">
          <Card>
            <CardHeader className="border-b border-border/60">
              <CardTitle className="text-lg">Configurações Fiscais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 [&_input]:h-8 [&_button[role='combobox']]:h-8">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="contribuinte">Contribuinte ICMS</Label>
                  <Select>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Contribuinte</SelectItem>
                      <SelectItem value="2">Contribuinte Isento</SelectItem>
                      <SelectItem value="9">Não Contribuinte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="suframa">SUFRAMA</Label>
                  <Input id="suframa" placeholder="Inscrição SUFRAMA" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regime">Regime Tributário</Label>
                  <Select>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Simples Nacional</SelectItem>
                      <SelectItem value="2">Simples Nacional - Excesso</SelectItem>
                      <SelectItem value="3">Regime Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox id="retainIss" />
                  <Label htmlFor="retainIss">Retém ISS</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="retainIr" />
                  <Label htmlFor="retainIr">Retém IR</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="retainPis" />
                  <Label htmlFor="retainPis">Retém PIS/COFINS/CSLL</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}




















