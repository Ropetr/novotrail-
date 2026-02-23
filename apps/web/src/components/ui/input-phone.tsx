import { forwardRef, useState } from "react"
import { Input } from "./input"
import { cn } from "@/lib/utils"

export interface InputPhoneProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: string
  onChange?: (value: string) => void
}

const InputPhone = forwardRef<HTMLInputElement, InputPhoneProps>(
  ({ className, value = "", onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(value)

    const formatPhone = (value: string) => {
      // Remove tudo que não é número
      const numbers = value.replace(/\D/g, "")

      // Aplica a máscara
      if (numbers.length <= 10) {
        // Telefone fixo: (00) 0000-0000
        return numbers
          .replace(/^(\d{2})(\d)/, "($1) $2")
          .replace(/(\d{4})(\d)/, "$1-$2")
      } else {
        // Celular: (00) 00000-0000
        return numbers
          .replace(/^(\d{2})(\d)/, "($1) $2")
          .replace(/(\d{5})(\d)/, "$1-$2")
          .slice(0, 15) // Limita o tamanho
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      const formatted = formatPhone(inputValue)
      setDisplayValue(formatted)

      // Retorna apenas os números para o parent
      const numbersOnly = inputValue.replace(/\D/g, "")
      onChange?.(numbersOnly)
    }

    return (
      <Input
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        className={cn(className)}
        placeholder="(00) 00000-0000"
        {...props}
      />
    )
  }
)

InputPhone.displayName = "InputPhone"

export { InputPhone }


