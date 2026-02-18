"use client"

import { useState } from "react"
import { ArrowLeft, Save, Building2, User, MapPin, CreditCard, FileText, Truck, Plus, Trash2 } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

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
  const [personType, setPersonType] = useState<"pf" | "pj">(client?.type || "pj")
  const [activeTab, setActiveTab] = useState("general")
  const [billingAddressSame, setBillingAddressSame] = useState(true)
  const [deliveryAddresses, setDeliveryAddresses] = useState<DeliveryAddress[]>([
    { id: "1", name: "Endereço Padrão", zipCode: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "", reference: "" }
  ])
  const [deliveryAddressSame, setDeliveryAddressSame] = useState(true)
  const isEditing = viewMode === "edit"
  const isViewOnly = viewMode === "view"

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

  const AddressFields = ({ prefix, disabled = false }: { prefix: string; disabled?: boolean }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-zipCode`}>CEP *</Label>
          <Input id={`${prefix}-zipCode`} placeholder="00000-000" disabled={disabled} />
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
      <div className="grid grid-cols-3 gap-4">
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
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor={`${prefix}-city`}>Cidade *</Label>
          <Input id={`${prefix}-city`} placeholder="Cidade" disabled={disabled} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-state`}>UF *</Label>
          <Select disabled={disabled}>
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
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Person Type Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Tipo de Pessoa:</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={personType === "pj" ? "default" : "outline"}
                size="sm"
                onClick={() => setPersonType("pj")}
                className={personType !== "pj" ? "bg-transparent" : ""}
              >
                <Building2 className="mr-2 h-4 w-4" />
                Pessoa Jurídica
              </Button>
              <Button
                type="button"
                variant={personType === "pf" ? "default" : "outline"}
                size="sm"
                onClick={() => setPersonType("pf")}
                className={personType !== "pf" ? "bg-transparent" : ""}
              >
                <User className="mr-2 h-4 w-4" />
                Pessoa Física
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
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
          <TabsTrigger value="carrier" className="gap-2">
            <Truck className="h-4 w-4" />
            Transportadora
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Identificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {personType === "pj" ? (
                <>
                  {/* Linha 1: Código, Razão Social, Nome Fantasia */}
                  <div className="grid grid-cols-6 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Código</Label>
                      <Input id="code" placeholder="Auto" disabled />
                    </div>
                    <div className="col-span-3 space-y-2">
                      <Label htmlFor="name">Razão Social *</Label>
                      <Input
                        id="name"
                        placeholder="Razão social da empresa"
                        defaultValue={client?.name}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="tradeName">Nome Fantasia</Label>
                      <Input
                        id="tradeName"
                        placeholder="Nome fantasia"
                        defaultValue={client?.tradeName}
                      />
                    </div>
                  </div>
                  {/* Linha 2: CNPJ, Inscrição Estadual, Inscrição Municipal */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="document">CNPJ *</Label>
                      <Input
                        id="document"
                        placeholder="00.000.000/0000-00"
                        defaultValue={client?.document}
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
                </>
              ) : (
                <>
                  {/* Pessoa Física */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Código</Label>
                      <Input id="code" placeholder="Auto" disabled />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        placeholder="Nome completo"
                        defaultValue={client?.name}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="document">CPF *</Label>
                      <Input
                        id="document"
                        placeholder="000.000.000-00"
                        defaultValue={client?.document}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
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
                        <SelectTrigger>
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
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    defaultValue={client?.email}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(00) 0000-0000"
                    defaultValue={client?.phone}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cellphone">Celular *</Label>
                  <Input id="cellphone" placeholder="(00) 00000-0000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
            <CardHeader>
              <CardTitle className="text-lg">Classificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="segment">Segmento</Label>
                  <Select>
                    <SelectTrigger>
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
                    <SelectTrigger>
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
                    <SelectTrigger>
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
        <TabsContent value="address" className="space-y-4">
          {/* Endereço Principal */}
          <Card>
            <CardHeader>
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
              <CardContent className="pt-4">
                <AddressFields prefix="billing" />
              </CardContent>
            )}
          </Card>

          {/* Endereços de Entrega */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Endereços de Entrega</CardTitle>
              <div className="flex items-center gap-4">
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
              <CardContent className="pt-4 space-y-6">
                {deliveryAddresses.map((addr, index) => (
                  <div key={addr.id} className="space-y-4">
                    {index > 0 && <div className="border-t border-border pt-6" />}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
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
        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Crédito e Limites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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
            <CardHeader>
              <CardTitle className="text-lg">Dados Bancários</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
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
                  <Input id="pixKey" placeholder="CPF, CNPJ, e-mail ou celular" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fiscal Tab */}
        <TabsContent value="fiscal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurações Fiscais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contribuinte">Contribuinte ICMS</Label>
                  <Select>
                    <SelectTrigger>
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
                    <SelectTrigger>
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
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch id="retainIss" />
                  <Label htmlFor="retainIss">Retém ISS</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="retainIr" />
                  <Label htmlFor="retainIr">Retém IR</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="retainPis" />
                  <Label htmlFor="retainPis">Retém PIS/COFINS/CSLL</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Carrier Tab (anteriormente Entrega) */}
        <TabsContent value="carrier" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transportadora Preferencial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carrier">Transportadora</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Transportadora ABC</SelectItem>
                      <SelectItem value="2">Expresso Rápido</SelectItem>
                      <SelectItem value="3">Logística Sul</SelectItem>
                      <SelectItem value="correios">Correios</SelectItem>
                      <SelectItem value="own">Entrega Própria</SelectItem>
                      <SelectItem value="pickup">Retira no Local</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryTime">Horário Preferencial</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Manhã (08h - 12h)</SelectItem>
                      <SelectItem value="afternoon">Tarde (13h - 18h)</SelectItem>
                      <SelectItem value="commercial">Horário Comercial</SelectItem>
                      <SelectItem value="any">Qualquer Horário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="freightType">Tipo de Frete</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cif">CIF (Frete por conta do remetente)</SelectItem>
                      <SelectItem value="fob">FOB (Frete por conta do destinatário)</SelectItem>
                      <SelectItem value="third">Frete por conta de terceiros</SelectItem>
                      <SelectItem value="free">Sem frete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Tipo de Veículo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="moto">Moto</SelectItem>
                      <SelectItem value="car">Carro</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="truck">Caminhão</SelectItem>
                      <SelectItem value="any">Qualquer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryNotes">Instruções de Entrega</Label>
                <Textarea
                  id="deliveryNotes"
                  placeholder="Instruções especiais para entrega... Ex: Entregar apenas com agendamento, ligar antes, etc."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Restrições de Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox id="requireSchedule" />
                  <Label htmlFor="requireSchedule" className="font-normal">Requer agendamento</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="restrictedAccess" />
                  <Label htmlFor="restrictedAccess" className="font-normal">Acesso restrito (portaria)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="noWeekend" />
                  <Label htmlFor="noWeekend" className="font-normal">Não entrega aos finais de semana</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose} className="bg-transparent">
          {isViewOnly ? "Fechar" : "Cancelar"}
        </Button>
        {!isViewOnly && (
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Salvar
          </Button>
        )}
      </div>
    </div>
  )
}
