import type { TokenResponse, OAuth2Config } from './types';

/**
 * Servico de Autenticacao OAuth2 para Nuvem Fiscal
 * Implementa cache de token com renovacao automatica
 */
export class NuvemFiscalAuthService {
  private config: OAuth2Config;
  private accessToken?: string;
  private tokenExpiry?: number;

  constructor(config: OAuth2Config) {
    this.config = config;
  }

  /**
   * Obtem um token de acesso valido
   * Usa cache quando possivel para evitar multiplas requisicoes
   */
  async obterAccessToken(): Promise<string> {
    // Verificar se ja tem token valido em cache
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      console.log('[NUVEM_FISCAL] Usando token em cache');
      return this.accessToken;
    }

    // Gerar novo token
    console.log('[NUVEM_FISCAL] Gerando novo token...');
    return await this.gerarNovoToken();
  }

  /**
   * Gera um novo token OAuth2 via Client Credentials Flow
   */
  private async gerarNovoToken(): Promise<string> {
    try {
      const response = await fetch(this.config.token_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.client_id,
          client_secret: this.config.client_secret,
          scope: 'cnpj cep empresa nfe nfce nfse cte mdfe',
        }).toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Erro ao obter token OAuth2: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
        );
      }

      const data: TokenResponse = await response.json();

      // Armazenar token em cache
      this.accessToken = data.access_token;

      // Expirar 5 minutos antes do tempo real para seguranca
      const expiracaoSegura = (data.expires_in - 300) * 1000;
      this.tokenExpiry = Date.now() + expiracaoSegura;

      console.log(`[NUVEM_FISCAL] Token obtido com sucesso. Expira em ${data.expires_in}s`);

      return this.accessToken;
    } catch (error: any) {
      console.error('[NUVEM_FISCAL] Erro ao gerar token:', error.message);
      throw new Error(`Falha na autenticacao com Nuvem Fiscal: ${error.message}`);
    }
  }

  /**
   * Invalida o token em cache (forca nova geracao na proxima requisicao)
   * Util quando recebe 401 Unauthorized
   */
  invalidarToken(): void {
    this.accessToken = undefined;
    this.tokenExpiry = undefined;
    console.log('[NUVEM_FISCAL] Token invalidado');
  }

  /**
   * Verifica se ha um token valido em cache
   */
  temTokenValido(): boolean {
    return !!(this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry);
  }
}
