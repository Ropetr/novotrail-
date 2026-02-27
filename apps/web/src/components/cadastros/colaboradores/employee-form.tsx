"use client"

import { useState } from "react"
import { Save, User, FileText, Briefcase, MessageSquare, X } from "lucide-react"
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
import { InputPhone } from "@/components/ui/input-phone"
import { toast } from "sonner"
import { useCreateColaborador, useUpdateColaborador } from "@/hooks/use-colaboradores"
import type { CreateColaboradorInput } from "@/services/cadastros/colaboradores"

interface EmployeeFormProps {
  employee?: Record<string, unknown>
  onClose: () => void
  viewMode?: "new" | "edit" | "view"
}

export function EmployeeForm({ employee, onClose, viewMode = "new" }: EmployeeFormProps) {
  const [activeTab, setActiveTab] = useState("personal")
  const [isSaving, setIsSaving] = useState(false)
  const isEditing = viewMode === "edit"
  const isViewOnly = viewMode === "view"

  const [phoneValue, setPhoneValue] = useState(employee?.phone || "")
  const [cellphoneValue, setCellphoneValue] = useState(employee?.cellphone || "")

  const createColaborador = useCreateColaborador()
  const updateColaborador = useUpdateColaborador()

  const handleSave = async () => {
    const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || ""
    
    const name = getVal("name")
    if (!name) { toast.error("Nome \xc3\xa9 obrigat\xc3\xb3rio"); return }
    
    const cpf = getVal("cpf")
    if (!cpf) { toast.error("CPF \xc3\xa9 obrigat\xc3\xb3rio"); return }
    
    const email = getVal("email")
    if (!email) { toast.error("E-mail \xc3\xa9 obrigat\xc3\xb3rio"); return }
    
    if (!phoneValue) { toast.error("Telefone \xc3\xa9 obrigat\xc3\xb3rio"); return }

    const payload: Record<string, unknown> = {
      name,
      document: cpf,
      email,
      phone: phoneValue,
      department: getVal("department") || undefined,
      position: getVal("position") || undefined,
      hireDate: getVal("admissionDate") || undefined,
      notes: getVal("notes") || undefined,
    }

    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) delete payload[key]
    })

    setIsSaving(true)

    try {
      if (isEditing && employee?.id) {
        await updateColaborador.mutateAsync({ id: employee.id, data: payload })
      } else {
        await createColaborador.mutateAsync(payload as CreateColaboradorInput)
      }
      onClose()
    } catch (error) {
      console.error("Erro ao salvar colaborador:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-3 [&_input]:h-8 [&_button[role='combobox']]:h-8">
      {/* Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-end justify-between gap-3">
          <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal" className="gap-2">
            <User className="h-4 w-4" />
            Dados Pessoais
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="contract" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Contrato
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Observa��es
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

        {/* Personal Tab */}
        <TabsContent value="personal" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Identifica��o</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Linha 1: C�digo, Nome Completo */}
              <div className="grid grid-cols-6 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="code">C�digo</Label>
                  <Input
                    id="code"
                    placeholder="Auto"
                    defaultValue={employee?.code}
                    disabled
                  />
                </div>
                <div className="col-span-5 space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    placeholder="Nome completo do colaborador"
                    defaultValue={employee?.name}
                    disabled={isViewOnly}
                  />
                </div>
              </div>

              {/* Linha 2: Data de Nascimento, Sexo, Estado Civil */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    defaultValue={employee?.birthDate}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Sexo</Label>
                  <Select defaultValue={employee?.gender} disabled={isViewOnly}>
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
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Estado Civil</Label>
                  <Select defaultValue={employee?.maritalStatus} disabled={isViewOnly}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Solteiro(a)</SelectItem>
                      <SelectItem value="married">Casado(a)</SelectItem>
                      <SelectItem value="divorced">Divorciado(a)</SelectItem>
                      <SelectItem value="widowed">Vi�vo(a)</SelectItem>
                      <SelectItem value="stable_union">Uni�o Est�vel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Linha 3: Nacionalidade, Naturalidade */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nacionalidade</Label>
                  <Input
                    id="nationality"
                    placeholder="Brasileiro(a)"
                    defaultValue={employee?.nationality || "Brasileiro(a)"}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthPlace">Naturalidade</Label>
                  <Input
                    id="birthPlace"
                    placeholder="Cidade/UF de nascimento"
                    defaultValue={employee?.birthPlace}
                    disabled={isViewOnly}
                  />
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
                    defaultValue={employee?.email}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <InputPhone
                    id="phone"
                    value={phoneValue}
                    onChange={setPhoneValue}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cellphone">Celular *</Label>
                  <InputPhone
                    id="cellphone"
                    value={cellphoneValue}
                    onChange={setCellphoneValue}
                    disabled={isViewOnly}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Endere�o</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    placeholder="00000-000"
                    defaultValue={employee?.zipCode}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="street">Logradouro</Label>
                  <Input
                    id="street"
                    placeholder="Rua, Avenida, etc."
                    defaultValue={employee?.street}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">N�mero</Label>
                  <Input
                    id="number"
                    placeholder="N�"
                    defaultValue={employee?.number}
                    disabled={isViewOnly}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    placeholder="Apto, Sala, etc."
                    defaultValue={employee?.complement}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    placeholder="Bairro"
                    defaultValue={employee?.neighborhood}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Refer�ncia</Label>
                  <Input
                    id="reference"
                    placeholder="Ponto de refer�ncia"
                    defaultValue={employee?.reference}
                    disabled={isViewOnly}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    placeholder="Cidade"
                    defaultValue={employee?.city}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">UF</Label>
                  <Select defaultValue={employee?.state} disabled={isViewOnly}>
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

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documentos Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    defaultValue={employee?.cpf}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    placeholder="00.000.000-0"
                    defaultValue={employee?.rg}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rgIssuer">�rg�o Emissor</Label>
                  <Input
                    id="rgIssuer"
                    placeholder="SSP/UF"
                    defaultValue={employee?.rgIssuer}
                    disabled={isViewOnly}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="voterRegistration">T�tulo de Eleitor</Label>
                  <Input
                    id="voterRegistration"
                    placeholder="0000 0000 0000"
                    defaultValue={employee?.voterRegistration}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="militaryService">Certificado de Reservista</Label>
                  <Input
                    id="militaryService"
                    placeholder="000000000-0"
                    defaultValue={employee?.militaryService}
                    disabled={isViewOnly}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documentos Trabalhistas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="ctps">CTPS (N�mero)</Label>
                  <Input
                    id="ctps"
                    placeholder="0000000"
                    defaultValue={employee?.ctps}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctpsSeries">CTPS (S�rie)</Label>
                  <Input
                    id="ctpsSeries"
                    placeholder="0000"
                    defaultValue={employee?.ctpsSeries}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctpsUf">CTPS (UF)</Label>
                  <Select defaultValue={employee?.ctpsUf} disabled={isViewOnly}>
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PR">PR</SelectItem>
                      <SelectItem value="SP">SP</SelectItem>
                      <SelectItem value="RJ">RJ</SelectItem>
                      <SelectItem value="MG">MG</SelectItem>
                      {/* Adicionar outros estados conforme necess�rio */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="pis">PIS/PASEP</Label>
                  <Input
                    id="pis"
                    placeholder="000.00000.00-0"
                    defaultValue={employee?.pis}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Conta Banc�ria (Sal�rio)</Label>
                  <Input
                    id="bankAccount"
                    placeholder="Banco - Ag�ncia - Conta"
                    defaultValue={employee?.bankAccount}
                    disabled={isViewOnly}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contract Tab */}
        <TabsContent value="contract" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados do Contrato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="admissionDate">Data de Admiss�o *</Label>
                  <Input
                    id="admissionDate"
                    type="date"
                    defaultValue={employee?.admissionDate}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractType">Tipo de Contrato *</Label>
                  <Select defaultValue={employee?.contractType || "CLT"} disabled={isViewOnly}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLT">CLT</SelectItem>
                      <SelectItem value="PJ">PJ</SelectItem>
                      <SelectItem value="Estagio">Est�gio</SelectItem>
                      <SelectItem value="Temporario">Tempor�rio</SelectItem>
                      <SelectItem value="Aprendiz">Aprendiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select defaultValue={employee?.status || "ativo"} disabled={isViewOnly}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="ferias">F�rias</SelectItem>
                      <SelectItem value="afastado">Afastado</SelectItem>
                      <SelectItem value="desligado">Desligado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cargo e Departamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="position">Cargo *</Label>
                  <Input
                    id="position"
                    placeholder="Ex: Vendedor, Gerente, etc."
                    defaultValue={employee?.position}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento *</Label>
                  <Select defaultValue={employee?.department} disabled={isViewOnly}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Comercial">Comercial</SelectItem>
                      <SelectItem value="Financeiro">Financeiro</SelectItem>
                      <SelectItem value="Log�stica">Log�stica</SelectItem>
                      <SelectItem value="Administrativo">Administrativo</SelectItem>
                      <SelectItem value="TI">TI</SelectItem>
                      <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="salary">Sal�rio</Label>
                  <Input
                    id="salary"
                    type="number"
                    step="0.01"
                    placeholder="R$ 0,00"
                    defaultValue={employee?.salary}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workSchedule">Jornada de Trabalho</Label>
                  <Select defaultValue={employee?.workSchedule} disabled={isViewOnly}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8h">8h/dia (44h semanais)</SelectItem>
                      <SelectItem value="6h">6h/dia (36h semanais)</SelectItem>
                      <SelectItem value="4h">4h/dia (20h semanais)</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager">Gestor Direto</Label>
                  <Select defaultValue={employee?.manager} disabled={isViewOnly}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Rodrigo Silva</SelectItem>
                      <SelectItem value="2">Juliana Martins</SelectItem>
                      <SelectItem value="3">Pedro Mendes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Benef�cios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="mealVoucher">Vale Refei��o (R$/dia)</Label>
                  <Input
                    id="mealVoucher"
                    type="number"
                    step="0.01"
                    placeholder="R$ 0,00"
                    defaultValue={employee?.mealVoucher}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transportVoucher">Vale Transporte (R$/dia)</Label>
                  <Input
                    id="transportVoucher"
                    type="number"
                    step="0.01"
                    placeholder="R$ 0,00"
                    defaultValue={employee?.transportVoucher}
                    disabled={isViewOnly}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="healthInsurance">Plano de Sa�de</Label>
                  <Select defaultValue={employee?.healthInsurance} disabled={isViewOnly}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">N�o possui</SelectItem>
                      <SelectItem value="basic">B�sico</SelectItem>
                      <SelectItem value="standard">Padr�o</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dentalInsurance">Plano Odontol�gico</Label>
                  <Select defaultValue={employee?.dentalInsurance} disabled={isViewOnly}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">N�o possui</SelectItem>
                      <SelectItem value="yes">Sim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Observa��es e Informa��es Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="notes">Observa��es Gerais</Label>
                <Textarea
                  id="notes"
                  placeholder="Informa��es adicionais sobre o colaborador..."
                  rows={5}
                  defaultValue={employee?.notes}
                  disabled={isViewOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Habilidades e Compet�ncias</Label>
                <Textarea
                  id="skills"
                  placeholder="Liste as principais habilidades do colaborador..."
                  rows={3}
                  defaultValue={employee?.skills}
                  disabled={isViewOnly}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Contato de Emerg�ncia</Label>
                  <Input
                    id="emergencyContact"
                    placeholder="Nome do contato"
                    defaultValue={employee?.emergencyContact}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Telefone de Emerg�ncia</Label>
                  <Input
                    id="emergencyPhone"
                    placeholder="(00) 00000-0000"
                    defaultValue={employee?.emergencyPhone}
                    disabled={isViewOnly}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}














