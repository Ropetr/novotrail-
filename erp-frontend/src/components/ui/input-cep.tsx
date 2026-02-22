import { forwardRef, useState } from "react"
import { Input } from "./input"
import { cn } from "@/lib/utils"
import { Search, Loader2 } from "lucide-react"

export interface InputCEPProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: string
  onChange?: (value: string) => void
  onSearch?: () => void
  isLoading?: boolean
}

const InputCEP = forwardRef<HTMLInputElement, InputCEPProps>(
  ({ className, value = "", onChange, onSearch, isLoading = false, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(value)

    const formatCEP = (value: string) => {
      const numbers = value.replace(/\D/g, "")
      return numbers.replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      const formatted = formatCEP(inputValue)
      setDisplayValue(formatted)

      const numbersOnly = inputValue.replace(/\D/g, "")
      onChange?.(numbersOnly)

      // Busca automaticamente quando completar 8 dígitos
      if (numbersOnly.length === 8 && onSearch) {
        onSearch()
      }
    }

    const handleSearchClick = () => {
      if (displayValue.replace(/\D/g, "").length === 8 && onSearch) {
        onSearch()
      }
    }

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="text"
          value={displayValue}
          onChange={handleChange}
          className={cn("pr-10", className)}
          placeholder="00000-000"
          {...props}
        />
        <button
          type="button"
          onClick={handleSearchClick}
          disabled={isLoading || displayValue.replace(/\D/g, "").length !== 8}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </button>
      </div>
    )
  }
)

InputCEP.displayName = "InputCEP"

export { InputCEP }


