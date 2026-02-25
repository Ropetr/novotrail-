/**
 * Retry Service with Circuit Breaker
 * Gerencia retentativas e circuit breaker para integrações externas (Nuvem Fiscal, SEFAZ, GNRE).
 */

interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

export class RetryService {
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private readonly failureThreshold = 5;
  private readonly recoveryTimeMs = 60000; // 1 minuto

  /**
   * Executa uma função com retry e exponential backoff
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    options: Partial<RetryOptions> = {},
    circuitName?: string
  ): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Verificar circuit breaker
    if (circuitName) {
      this.checkCircuitBreaker(circuitName);
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
      try {
        const result = await fn();

        // Sucesso: resetar circuit breaker
        if (circuitName) {
          this.resetCircuitBreaker(circuitName);
        }

        return result;
      } catch (error: any) {
        lastError = error;

        // Verificar se é um erro retentável
        if (!this.isRetryable(error, opts.retryableErrors)) {
          throw error;
        }

        // Última tentativa: não esperar
        if (attempt === opts.maxRetries) {
          break;
        }

        // Registrar falha no circuit breaker
        if (circuitName) {
          this.recordFailure(circuitName);
        }

        // Calcular delay com exponential backoff + jitter
        const delay = this.calculateDelay(attempt, opts);
        console.warn(
          `[Retry] Tentativa ${attempt + 1}/${opts.maxRetries} falhou. ` +
            `Próxima em ${delay}ms. Erro: ${error.message}`
        );

        await this.sleep(delay);
      }
    }

    // Registrar falha final no circuit breaker
    if (circuitName) {
      this.recordFailure(circuitName);
    }

    throw lastError || new Error('Todas as tentativas falharam');
  }

  /**
   * Verifica se o circuit breaker permite a chamada
   */
  private checkCircuitBreaker(name: string): void {
    const state = this.circuitBreakers.get(name);
    if (!state) return;

    if (state.state === 'open') {
      const timeSinceLastFailure = Date.now() - state.lastFailure;
      if (timeSinceLastFailure > this.recoveryTimeMs) {
        // Transição para half-open
        state.state = 'half-open';
        this.circuitBreakers.set(name, state);
      } else {
        throw new Error(
          `Circuit breaker '${name}' está aberto. ` +
            `Próxima tentativa em ${Math.ceil((this.recoveryTimeMs - timeSinceLastFailure) / 1000)}s`
        );
      }
    }
  }

  /**
   * Registra uma falha no circuit breaker
   */
  private recordFailure(name: string): void {
    const state = this.circuitBreakers.get(name) || {
      failures: 0,
      lastFailure: 0,
      state: 'closed' as const,
    };

    state.failures++;
    state.lastFailure = Date.now();

    if (state.failures >= this.failureThreshold) {
      state.state = 'open';
      console.error(`[CircuitBreaker] '${name}' ABERTO após ${state.failures} falhas`);
    }

    this.circuitBreakers.set(name, state);
  }

  /**
   * Reseta o circuit breaker após sucesso
   */
  private resetCircuitBreaker(name: string): void {
    this.circuitBreakers.set(name, {
      failures: 0,
      lastFailure: 0,
      state: 'closed',
    });
  }

  /**
   * Verifica se o erro é retentável
   */
  private isRetryable(error: any, retryableErrors?: string[]): boolean {
    // Erros de rede são sempre retentáveis
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      return true;
    }

    // HTTP 429 (rate limit), 500, 502, 503, 504 são retentáveis
    if (error.status && [429, 500, 502, 503, 504].includes(error.status)) {
      return true;
    }

    // HTTP 400, 401, 403, 404, 422 NÃO são retentáveis
    if (error.status && [400, 401, 403, 404, 422].includes(error.status)) {
      return false;
    }

    // Verificar lista customizada
    if (retryableErrors && error.code) {
      return retryableErrors.includes(error.code);
    }

    // Por padrão, erros genéricos são retentáveis
    return true;
  }

  /**
   * Calcula delay com exponential backoff + jitter
   */
  private calculateDelay(attempt: number, opts: RetryOptions): number {
    const exponentialDelay = opts.baseDelayMs * Math.pow(opts.backoffMultiplier, attempt);
    const cappedDelay = Math.min(exponentialDelay, opts.maxDelayMs);
    // Adicionar jitter (±25%)
    const jitter = cappedDelay * 0.25 * (Math.random() * 2 - 1);
    return Math.max(0, Math.round(cappedDelay + jitter));
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retorna o estado atual de todos os circuit breakers
   */
  getCircuitBreakerStatus(): Record<string, CircuitBreakerState> {
    const status: Record<string, CircuitBreakerState> = {};
    this.circuitBreakers.forEach((state, name) => {
      status[name] = { ...state };
    });
    return status;
  }
}
