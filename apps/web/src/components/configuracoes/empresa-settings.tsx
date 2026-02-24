import { useState, useEffect, useRef } from "react"
import { Building2, Upload, Trash2, Loader2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEmpresaSettings, useUpdateEmpresaSettings, useUploadLogo, useDeleteLogo } from "@/hooks/use-configuracoes"
import type { TenantSettings } from "@/services/configuracoes/empresa"
import { configuracoesService } from "@/services/configuracoes/empresa"

const UF_OPTIONS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
]

export function EmpresaSettings() {
  const { data, isLoading } = useEmpresaSettings()
  const updateMutation = useUpdateEmpresaSettings()
  const uploadLogoMutation = useUploadLogo()
  const deleteLogoMutation = useDeleteLogo()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileInputFiscalRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<Partial<TenantSettings>>({})
  const [isDirty, setIsDirty] = useState(false)

  // Populate form when data loads
  useEffect(() => {
    if (data?.data) {
      setForm(data.data)
      setIsDirty(false)
    }
  }, [data])

  const handleChange = (field: keyof TenantSettings, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  const handleSave = () => {
    updateMutation.mutate(form, {
      onSuccess: () => setIsDirty(false),
    })
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'logoFiscal') => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadLogoMutation.mutate({ file, type })
    e.target.value = ''
  }

  const handleLogoDelete = (type: 'logo' | 'logoFiscal') => {
    deleteLogoMutation.mutate(type)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Carregando dados da empresa...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Dados Básicos */}
      <Card>
        <CardHeader className="border-b border-border/60 py-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Dados da Empresa</CardTitle>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isDirty || updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <><Loader2 className="h-3 w-3 animate-spin mr-1" />Salvando...</>
              ) : "Salvar"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 [&_input]:h-8 [&_textarea]:text-sm">
          {/* Razão Social / Nome Fantasia */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Razão Social *</Label>
              <Input
                value={form.razaoSocial || ""}
                onChange={e => handleChange("razaoSocial", e.target.value)}
                placeholder="Razão Social da empresa"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nome Fantasia</Label>
              <Input
                value={form.nomeFantasia || ""}
                onChange={e => handleChange("nomeFantasia", e.target.value)}
                placeholder="Nome Fantasia"
              />
            </div>
          </div>

          {/* CNPJ / IE / IM */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">CNPJ *</Label>
              <Input
                value={form.cnpj || ""}
                onChange={e => handleChange("cnpj", e.target.value)}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Inscrição Estadual</Label>
              <Input
                value={form.ie || ""}
                onChange={e => handleChange("ie", e.target.value)}
                placeholder="Inscrição Estadual"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Inscrição Municipal</Label>
              <Input
                value={form.im || ""}
                onChange={e => handleChange("im", e.target.value)}
                placeholder="Inscrição Municipal"
              />
            </div>
          </div>

          {/* Contato */}
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Telefone</Label>
              <Input
                value={form.telefone || ""}
                onChange={e => handleChange("telefone", e.target.value)}
                placeholder="(00) 0000-0000"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Celular</Label>
              <Input
                value={form.celular || ""}
                onChange={e => handleChange("celular", e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">E-mail</Label>
              <Input
                value={form.email || ""}
                onChange={e => handleChange("email", e.target.value)}
                placeholder="contato@empresa.com.br"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Site</Label>
              <Input
                value={form.site || ""}
                onChange={e => handleChange("site", e.target.value)}
                placeholder="www.empresa.com.br"
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">CEP</Label>
              <Input
                value={form.cep || ""}
                onChange={e => handleChange("cep", e.target.value)}
                placeholder="00000-000"
              />
            </div>
            <div className="col-span-4 space-y-1.5">
              <Label className="text-xs">Endereço</Label>
              <Input
                value={form.endereco || ""}
                onChange={e => handleChange("endereco", e.target.value)}
                placeholder="Rua, Avenida..."
              />
            </div>
            <div className="col-span-1 space-y-1.5">
              <Label className="text-xs">Nº</Label>
              <Input
                value={form.numero || ""}
                onChange={e => handleChange("numero", e.target.value)}
                placeholder="Nº"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">Complemento</Label>
              <Input
                value={form.complemento || ""}
                onChange={e => handleChange("complemento", e.target.value)}
                placeholder="Sala, Andar..."
              />
            </div>
            <div className="col-span-3 space-y-1.5">
              <Label className="text-xs">Bairro</Label>
              <Input
                value={form.bairro || ""}
                onChange={e => handleChange("bairro", e.target.value)}
                placeholder="Bairro"
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-4 space-y-1.5">
              <Label className="text-xs">Cidade</Label>
              <Input
                value={form.cidade || ""}
                onChange={e => handleChange("cidade", e.target.value)}
                placeholder="Cidade"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">UF</Label>
              <select
                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.uf || ""}
                onChange={e => handleChange("uf", e.target.value)}
              >
                <option value="">Selecione</option>
                {UF_OPTIONS.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logos */}
      <Card>
        <CardHeader className="border-b border-border/60 py-3 px-4">
          <CardTitle className="text-base">Logotipos</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Logo Principal */}
            <div className="space-y-3">
              <Label className="text-xs font-medium">Logo Principal</Label>
              <p className="text-xs text-muted-foreground">Usada em orçamentos, vendas e documentos. PNG, JPG ou SVG. Máx 2MB.</p>
              <div className="flex items-center gap-3">
                {form.logoUrl ? (
                  <div className="relative h-16 w-40 rounded border bg-white flex items-center justify-center overflow-hidden">
                    <img
                      src={configuracoesService.getLogoUrl('logo')}
                      alt="Logo"
                      className="h-full object-contain"
                      crossOrigin="anonymous"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-40 rounded border border-dashed flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={e => handleLogoUpload(e, 'logo')}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadLogoMutation.isPending}
                  >
                    {uploadLogoMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                    Enviar
                  </Button>
                  {form.logoUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive hover:text-destructive"
                      onClick={() => handleLogoDelete('logo')}
                      disabled={deleteLogoMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />Remover
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Logo Fiscal */}
            <div className="space-y-3">
              <Label className="text-xs font-medium">Logo Fiscal (NF-e)</Label>
              <p className="text-xs text-muted-foreground">Usada no DANFE da Nota Fiscal Eletrônica. PNG ou JPG. Máx 2MB.</p>
              <div className="flex items-center gap-3">
                {form.logoFiscalUrl ? (
                  <div className="relative h-16 w-40 rounded border bg-white flex items-center justify-center overflow-hidden">
                    <img
                      src={configuracoesService.getLogoUrl('logoFiscal')}
                      alt="Logo Fiscal"
                      className="h-full object-contain"
                      crossOrigin="anonymous"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-40 rounded border border-dashed flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <input
                    ref={fileInputFiscalRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={e => handleLogoUpload(e, 'logoFiscal')}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => fileInputFiscalRef.current?.click()}
                    disabled={uploadLogoMutation.isPending}
                  >
                    {uploadLogoMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                    Enviar
                  </Button>
                  {form.logoFiscalUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive hover:text-destructive"
                      onClick={() => handleLogoDelete('logoFiscal')}
                      disabled={deleteLogoMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />Remover
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações Padrão */}
      <Card>
        <CardHeader className="border-b border-border/60 py-3 px-4">
          <CardTitle className="text-base">Observações Padrão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <p className="text-xs text-muted-foreground">
            Textos preenchidos automaticamente nos documentos. O vendedor pode editar antes de salvar.
          </p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Observação Padrão — Orçamento</Label>
              <Textarea
                rows={2}
                value={form.obsPadraoOrcamento || ""}
                onChange={e => handleChange("obsPadraoOrcamento", e.target.value)}
                placeholder="Ex: Orçamento válido por 15 dias. Preços sujeitos a alteração sem aviso prévio."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Observação Padrão — Venda</Label>
              <Textarea
                rows={2}
                value={form.obsPadraoVenda || ""}
                onChange={e => handleChange("obsPadraoVenda", e.target.value)}
                placeholder="Ex: Mercadoria conferida e em perfeito estado."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Observação Padrão — NF-e (futuro)</Label>
              <Textarea
                rows={2}
                value={form.obsPadraoNfe || ""}
                onChange={e => handleChange("obsPadraoNfe", e.target.value)}
                placeholder="Ex: Informações adicionais da nota fiscal."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Mensagem de Rodapé</Label>
            <Input
              value={form.mensagemRodape || ""}
              onChange={e => handleChange("mensagemRodape", e.target.value)}
              placeholder="Ex: Obrigado e volte sempre!"
              className="h-8"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
