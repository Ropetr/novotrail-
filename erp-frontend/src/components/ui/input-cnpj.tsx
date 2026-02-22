import * as React from 'react';
import { Input } from './input';
import { aplicarMascaraCNPJ, validarCNPJ } from '@/services/nuvem-fiscal';
import { cn } from '@/lib/utils';
import { Loader2, Check, X, Search } from 'lucide-react';

export interface InputCNPJProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: () => void;
  isLoading?: boolean;
  showValidation?: boolean;
}

/**
 * Componente de Input com máscara de CNPJ
 * - Aplica máscara automaticamente (##.###.###/####-##)
 * - Valida dígitos verificadores
 * - Mostra ícone de validação
 * - Permite busca ao pressionar Enter ou clicar no ícone
 */
export const InputCNPJ = React.forwardRef<HTMLInputElement, InputCNPJProps>(
  ({ value = '', onChange, onSearch, isLoading, showValidation = true, className, onBlur, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value);
    const [isValid, setIsValid] = React.useState<boolean | null>(null);

    // Atualiza valor interno quando prop value mudar
    React.useEffect(() => {
      setInternalValue(value);

      // Valida apenas se tiver 14 dígitos
      const cnpjLimpo = value.replace(/\D/g, '');
      if (cnpjLimpo.length === 14) {
        setIsValid(validarCNPJ(cnpjLimpo));
      } else {
        setIsValid(null);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const maskedValue = aplicarMascaraCNPJ(rawValue);
      const cnpjLimpo = maskedValue.replace(/\D/g, '');

      setInternalValue(maskedValue);

      // Valida em tempo real se tiver 14 dígitos
      if (cnpjLimpo.length === 14) {
        setIsValid(validarCNPJ(cnpjLimpo));
      } else {
        setIsValid(null);
      }

      if (onChange) {
        onChange(maskedValue);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch && isValid) {
        e.preventDefault();
        onSearch();
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Chama onBlur do pai
      if (onBlur) {
        onBlur(e);
      }

      // Se CNPJ for válido, dispara busca automaticamente
      if (onSearch && isValid && !isLoading) {
        onSearch();
      }
    };

    const getIcon = () => {
      if (isLoading) {
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      }

      if (!showValidation || !internalValue) {
        return onSearch ? (
          <Search
            className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary"
            onClick={() => isValid && onSearch()}
          />
        ) : null;
      }

      if (isValid) {
        return (
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4 text-green-500" />
            {onSearch && (
              <Search
                className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary"
                onClick={onSearch}
              />
            )}
          </div>
        );
      }

      if (isValid === false) {
        return <X className="h-4 w-4 text-primary" />;
      }

      return null;
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="text"
          value={internalValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="00.000.000/0000-00"
          maxLength={18}
          disabled={isLoading}
          className={cn(
            'pr-10',
            isValid === false && 'border-red-500 focus-visible:ring-red-500',
            isValid === true && 'border-green-500 focus-visible:ring-green-500',
            className
          )}
          {...props}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {getIcon()}
        </div>
      </div>
    );
  }
);

InputCNPJ.displayName = 'InputCNPJ';


