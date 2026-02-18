import type { OAuth2Config, ApiResponse } from './types';
import { NuvemFiscalAuthService } from './auth-service';

/**
 * Cliente HTTP para a API Nuvem Fiscal
 * Gerencia autenticacao, requisicoes e tratamento de erros
 */
export class NuvemFiscalClient {
  private config: OAuth2Config;
  private authService: NuvemFiscalAuthService;

  constructor(config: OAuth2Config) {
    this.config = config;
    this.authService = new NuvemFiscalAuthService(config);
  }

  /**
   * Realiza uma requisicao GET autenticada
   */
  async get<T>(endpoint: string, queryParams?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, queryParams);
  }

  /**
   * Realiza uma requisicao POST autenticada
   */
  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, body);
  }

  /**
   * Realiza uma requisicao PUT autenticada
   */
  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, body);
  }

  /**
   * Realiza uma requisicao DELETE autenticada
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint);
  }

  /**
   * Metodo generico para fazer requisicoes HTTP autenticadas
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: any,
    queryParams?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    try {
      // Obter token de acesso
      const accessToken = await this.authService.obterAccessToken();

      // Construir URL com query parameters
      let url = `${this.config.api_url}${endpoint}`;
      if (queryParams) {
        const params = new URLSearchParams(
          Object.entries(queryParams)
            .filter(([_, value]) => value !== undefined && value !== null)
            .map(([key, value]) => [key, String(value)] as [string, string])
        ).toString();
        if (params) {
          url += `?${params}`;
        }
      }

      // Preparar headers
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      };

      if (body && method !== 'GET') {
        headers['Content-Type'] = 'application/json';
      }

      // Fazer requisicao
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      // Tratamento de respostas
      return await this.handleResponse<T>(response);

    } catch (error: any) {
      console.error(`[NUVEM_FISCAL] Erro na requisicao ${method} ${endpoint}:`, error);
      return {
        success: false,
        error: 'Erro ao comunicar com Nuvem Fiscal',
        details: { message: error.message },
      };
    }
  }

  /**
   * Processa a resposta HTTP e trata erros
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    // Resposta sem conteudo (204 No Content)
    if (response.status === 204) {
      return { success: true };
    }

    // Tentar parsear JSON
    let data: any;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    // Sucesso (2xx)
    if (response.ok) {
      return {
        success: true,
        data: data as T,
      };
    }

    // Erros especificos
    if (response.status === 401) {
      // Invalidar token em cache
      this.authService.invalidarToken();
      return {
        success: false,
        error: 'Nao autenticado. Token invalido ou expirado.',
        details: { statusCode: 401, ...data },
      };
    }

    if (response.status === 404) {
      return {
        success: false,
        error: 'Recurso nao encontrado',
        details: { statusCode: 404, ...data },
      };
    }

    if (response.status === 422) {
      return {
        success: false,
        error: 'Dados invalidos',
        details: { statusCode: 422, validation: data },
      };
    }

    if (response.status === 429) {
      return {
        success: false,
        error: 'Limite de requisicoes atingido. Tente novamente mais tarde.',
        details: { statusCode: 429, ...data },
      };
    }

    // Erro generico
    return {
      success: false,
      error: `Erro na API Nuvem Fiscal: ${response.statusText}`,
      details: { statusCode: response.status, ...data },
    };
  }

  /**
   * Upload de arquivo via multipart/form-data
   * Usado para upload de certificado digital
   */
  async uploadFile(endpoint: string, file: Blob, fileName: string, additionalFields?: Record<string, string>): Promise<ApiResponse<any>> {
    try {
      const accessToken = await this.authService.obterAccessToken();

      const formData = new FormData();
      formData.append('file', file, fileName);

      if (additionalFields) {
        for (const [key, value] of Object.entries(additionalFields)) {
          formData.append(key, value);
        }
      }

      const response = await fetch(`${this.config.api_url}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      return await this.handleResponse(response);

    } catch (error: any) {
      console.error(`[NUVEM_FISCAL] Erro no upload de arquivo:`, error);
      return {
        success: false,
        error: 'Erro ao fazer upload do arquivo',
        details: { message: error.message },
      };
    }
  }
}
