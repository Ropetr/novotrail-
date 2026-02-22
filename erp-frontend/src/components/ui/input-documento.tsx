import { forwardRef, useState } from "react"
import { Input } from "./input"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, Search, Loader2 } from "lucide-react"

export interface InputDocumentoProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: string
  onChange?: (value: string, type: "cpf" | "cnpj" | null) => void
  onTypeDetected?: (type: "cpf" | "cnpj" | null) => void
  onCNPJSearch?: (cnpj: string) => void
  isSearching?: boolean
  showValidation?: boolean
}

// Validação de CPF
const validateCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, "")
  if (numbers.length !== 11) return false
  if (/^(\d)\1{10}$/.test(numbers)) return false

  let sum = 0
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (11 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(numbers.substring(9, 10))) return false

  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (12 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(numbers.substring(10, 11))) return false

  return true
}

// Validação de CNPJ
const validateCNPJ = (cnpj: string): boolean => {
  const numbers = cnpj.replace(/\D/g, "")
  if (numbers.length !== 14) return false
  if (/^(\d)\1{13}$/.test(numbers)) return false

  let size = numbers.length - 2
  let nums = numbers.substring(0, size)
  const digits = numbers.substring(size)
  let sum = 0
  let pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += parseInt(nums.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) return false

  size = size + 1
  nums = numbers.substring(0, size)
  sum = 0
  pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += parseInt(nums.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(1))) return false

  return true
}

const InputDocumento = forwardRef<HTMLInputElement, InputDocumentoProps>(
  ({
    className,
    value = "",
    onChange,
    onTypeDetected,
    onCNPJSearch,
    isSearching = false,
    showValidation = false,
    ...props
  }, ref) => {
    const [displayValue, setDisplayValue] = useState(value)

    const formatDocument = (value: string) => {
      const numbers = value.replace(/\D/g, "")

      if (numbers.length <= 11) {
        // CPF: 000.000.000-00
        return numbers
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
          .slice(0, 14)
      } else {
        // CNPJ: 00.000.000/0000-00
        return numbers
          .replace(/(\d{2})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d)/, "$1/$2")
          .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
          .slice(0, 18)
      }
    }

    const detectType = (numbers: string): "cpf" | "cnpj" | null => {
      if (numbers.length === 11) return "cpf"
      if (numbers.length === 14) return "cnpj"
      return null
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      const formatted = formatDocument(inputValue)
      setDisplayValue(formatted)

      const numbersOnly = inputValue.replace(/\D/g, "")
      const type = detectType(numbersOnly)

      onChange?.(numbersOnly, type)
      onTypeDetected?.(type)
    }

    const handleBlur = () => {
      // Removido: busca automática no blur
      // Agora a busca só acontece quando clicar no botão
    }

    const handleSearchClick = () => {
      const numbers = displayValue.replace(/\D/g, "")
      if (numbers.length === 14 && validateCNPJ(displayValue) && onCNPJSearch) {
        onCNPJSearch(numbers)
      }
    }

    const numbers = displayValue.replace(/\D/g, "")
    const isComplete = numbers.length === 11 || numbers.length === 14
    const isValid = isComplete && (
      (numbers.length === 11 && validateCPF(displayValue)) ||
      (numbers.length === 14 && validateCNPJ(displayValue))
    )
    const showSearchButton = numbers.length === 14 && onCNPJSearch

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            showValidation && isComplete && (
              isValid ? "pr-10 border-green-500" : "pr-10 border-red-500"
            ),
            showSearchButton && !showValidation && "pr-10",
            className
          )}
          placeholder="CPF ou CNPJ"
          {...props}
        />

        {/* Ícone de validação ou botão de busca */}
        {showValidation && isComplete && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-primary" />
            )}
          </div>
        )}

        {/* Botão de busca CNPJ (aparece só para CNPJ válido e se não mostrar validação) */}
        {showSearchButton && !showValidation && isValid && (
          <button
            type="button"
            onClick={handleSearchClick}
            disabled={isSearching}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
            title="Buscar dados na Receita Federal"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    )
  }
)

InputDocumento.displayName = "InputDocumento"

export { InputDocumento, validateCPF, validateCNPJ }



