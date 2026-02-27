import { useState } from 'react';
import { consultarCNPJ, CNPJData } from '../services/nuvem-fiscal';
import { toast } from 'sonner';

interface UseCNPJLookupOptions {
  onSuccess?: (data: CNPJData) => void;
  onError?: (error: string) => void;
}

/**
 * Hook para buscar dados de CNPJ na Nuvem Fiscal
 *
 * @example
 * const { buscar, isLoading, error, data } = useCNPJLookup({
 *   onSuccess: (data) => {
 *     setValue('razao_social', data.razao_social);
 *   }
 * });
 */
export function useCNPJLookup(options?: UseCNPJLookupOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CNPJData | null>(null);

  /**
   * Busca dados do CNPJ
   */
  const buscar = async (cnpj: string) => {
    if (!cnpj || cnpj.replace(/\D/g, '').length !== 14) {
      const errorMsg = 'CNPJ inválido ou incompleto';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      toast.loading('Consultando CNPJ na Receita Federal...', { id: 'cnpj-lookup' });

      const response = await consultarCNPJ(cnpj);

      if (response.success && response.data) {
        setData(response.data);
        toast.success('CNPJ encontrado! Dados preenchidos automaticamente.', { id: 'cnpj-lookup' });

        if (options?.onSuccess) {
          options.onSuccess(response.data);
        }
      } else {
        const errorMsg = response.error || 'CNPJ não encontrado';
        setError(errorMsg);
        toast.error(errorMsg, { id: 'cnpj-lookup' });

        if (options?.onError) {
          options.onError(errorMsg);
        }
      }
    } catch (err) {
      const errorMsg = (err as { message?: string })?.message || 'Erro ao consultar CNPJ';
      setError(errorMsg);
      toast.error(errorMsg, { id: 'cnpj-lookup' });

      if (options?.onError) {
        options.onError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Limpa erro
   */
  const limparErro = () => {
    setError(null);
  };

  /**
   * Limpa dados
   */
  const limpar = () => {
    setData(null);
    setError(null);
  };

  return {
    buscar,
    isLoading,
    error,
    data,
    limparErro,
    limpar,
  };
}
