import { forwardRef, useState } from "react"
import { Input } from "./input"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle } from "lucide-react"

export interface InputCPFProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: string
  onChange?: (value: string) => void
  showValidation?: boolean
}

// Função de validação de CPF
const validateCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, "")

  if (numbers.length !== 11) return false
  if (/^(\d)\1{10}$/.test(numbers)) return false // CPFs com todos dígitos iguais

  let sum = 0
  let remainder

  // Valida primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(numbers.substring(9, 10))) return false

  sum = 0
  // Valida segundo dígito verificador
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (12 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(numbers.substring(10, 11))) return false

  return true
}

const InputCPF = forwardRef<HTMLInputElement, InputCPFProps>(
  ({ className, value = "", onChange, showValidation = false, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(value)

    const formatCPF = (value: string) => {
      const numbers = value.replace(/\D/g, "")
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
        .slice(0, 14)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      const formatted = formatCPF(inputValue)
      setDisplayValue(formatted)

      const numbersOnly = inputValue.replace(/\D/g, "")
      onChange?.(numbersOnly)
    }

    const numbers = displayValue.replace(/\D/g, "")
    const isValid = numbers.length === 11 && validateCPF(displayValue)
    const isInvalid = numbers.length === 11 && !validateCPF(displayValue)

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="text"
          value={displayValue}
          onChange={handleChange}
          className={cn(
            showValidation && numbers.length === 11 && (
              isValid ? "pr-10 border-green-500" : "pr-10 border-red-500"
            ),
            className
          )}
          placeholder="000.000.000-00"
          {...props}
        />
        {showValidation && numbers.length === 11 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
          </div>
        )}
      </div>
    )
  }
)

InputCPF.displayName = "InputCPF"

export { InputCPF, validateCPF }
