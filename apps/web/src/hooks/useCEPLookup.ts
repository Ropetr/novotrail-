import { useState } from "react"
import { toast } from "sonner"

interface CEPData {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

interface UseCEPLookupProps {
  onSuccess?: (data: CEPData) => void
  onError?: (error: string) => void
}

export function useCEPLookup({ onSuccess, onError }: UseCEPLookupProps = {}) {
  const [isLoading, setIsLoading] = useState(false)

  const buscar = async (cep: string) => {
    // Remove tudo que não é número
    const cleanCEP = cep.replace(/\D/g, "")

    if (cleanCEP.length !== 8) {
      const errorMsg = "CEP deve conter 8 dígitos"
      toast.error(errorMsg)
      onError?.(errorMsg)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)

      if (!response.ok) {
        throw new Error("Erro ao buscar CEP")
      }

      const data: CEPData = await response.json()

      if (data.erro) {
        const errorMsg = "CEP não encontrado"
        toast.error(errorMsg)
        onError?.(errorMsg)
        return
      }

      toast.success("CEP encontrado!")
      onSuccess?.(data)
    } catch (error) {
      const errorMsg = "Erro ao buscar CEP. Tente novamente."
      toast.error(errorMsg)
      onError?.(errorMsg)
      console.error("Erro ao buscar CEP:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return { buscar, isLoading }
}
