import { createContext, useContext, useState, ReactNode } from "react"

// Types para os dados de export
export interface ExportData {
  sourceType: "cliente" | "fornecedor" | "parceiro" | "produto"
  targetType: "cliente" | "fornecedor" | "parceiro" | "produto"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any> // Os dados da entidade sendo exportada - aceita qualquer tipo de entidade
  tabId?: string // ID da aba de destino
}

interface ExportContextType {
  exportData: ExportData | null
  setExportData: (data: ExportData | null) => void
  consumeExportData: () => ExportData | null // Consome e limpa os dados
}

const ExportContext = createContext<ExportContextType | undefined>(undefined)

export function ExportProvider({ children }: { children: ReactNode }) {
  const [exportData, setExportData] = useState<ExportData | null>(null)

  const consumeExportData = () => {
    const data = exportData
    setExportData(null) // Limpa após consumir
    return data
  }

  return (
    <ExportContext.Provider value={{ exportData, setExportData, consumeExportData }}>
      {children}
    </ExportContext.Provider>
  )
}

export function useExport() {
  const context = useContext(ExportContext)
  if (context === undefined) {
    throw new Error("useExport must be used within an ExportProvider")
  }
  return context
}



