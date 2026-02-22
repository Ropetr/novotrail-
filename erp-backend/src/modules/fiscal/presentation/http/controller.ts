import { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { OAuth2Config, ConfiguracaoCTe } from '../../infrastructure/nuvem-fiscal/types';
import { NuvemFiscalService } from '../../infrastructure/nuvem-fiscal/service';

// Use Cases - CNPJ
import { ConsultarCNPJUseCase } from '../../application/use-cases/consultar-cnpj';

// Use Cases - Empresa
import {
  ListarEmpresasUseCase,
  CadastrarEmpresaUseCase,
  ConsultarEmpresaUseCase,
  AlterarEmpresaUseCase,
  DeletarEmpresaUseCase,
} from '../../application/use-cases/gerenciar-empresa';

// Use Cases - Certificado
import {
  ListarCertificadosUseCase,
  ConsultarCertificadoUseCase,
  CadastrarCertificadoBase64UseCase,
  UploadCertificadoUseCase,
  DeletarCertificadoUseCase,
} from '../../application/use-cases/gerenciar-certificado';

// Validators
import {
  consultarCNPJSchema,
  empresaSchema,
  cadastrarCertificadoBase64Schema,
  configuracaoCTeSchema,
} from './validators';

/**
 * Controller para gerenciar todas as operacoes da Nuvem Fiscal
 */
export class NuvemFiscalController {
  private nuvemFiscalService: NuvemFiscalService;

  // Use Cases - CNPJ
  private consultarCNPJUseCase: ConsultarCNPJUseCase;

  // Use Cases - Empresa
  private listarEmpresasUseCase: ListarEmpresasUseCase;
  private cadastrarEmpresaUseCase: CadastrarEmpresaUseCase;
  private consultarEmpresaUseCase: ConsultarEmpresaUseCase;
  private alterarEmpresaUseCase: AlterarEmpresaUseCase;
  private deletarEmpresaUseCase: DeletarEmpresaUseCase;

  // Use Cases - Certificado
  private listarCertificadosUseCase: ListarCertificadosUseCase;
  private consultarCertificadoUseCase: ConsultarCertificadoUseCase;
  private cadastrarCertificadoBase64UseCase: CadastrarCertificadoBase64UseCase;
  private uploadCertificadoUseCase: UploadCertificadoUseCase;
  private deletarCertificadoUseCase: DeletarCertificadoUseCase;

  constructor(env: any) {
    // Configuracao OAuth2
    const config: OAuth2Config = {
      client_id: env.NUVEM_FISCAL_CLIENT_ID,
      client_secret: env.NUVEM_FISCAL_CLIENT_SECRET,
      token_url: env.NUVEM_FISCAL_TOKEN_URL,
      api_url: env.NUVEM_FISCAL_API_URL,
    };

    this.nuvemFiscalService = new NuvemFiscalService(config);

    // Inicializar Use Cases - CNPJ
    this.consultarCNPJUseCase = new ConsultarCNPJUseCase(this.nuvemFiscalService);

    // Inicializar Use Cases - Empresa
    this.listarEmpresasUseCase = new ListarEmpresasUseCase(this.nuvemFiscalService);
    this.cadastrarEmpresaUseCase = new CadastrarEmpresaUseCase(this.nuvemFiscalService);
    this.consultarEmpresaUseCase = new ConsultarEmpresaUseCase(this.nuvemFiscalService);
    this.alterarEmpresaUseCase = new AlterarEmpresaUseCase(this.nuvemFiscalService);
    this.deletarEmpresaUseCase = new DeletarEmpresaUseCase(this.nuvemFiscalService);

    // Inicializar Use Cases - Certificado
    this.listarCertificadosUseCase = new ListarCertificadosUseCase(this.nuvemFiscalService);
    this.consultarCertificadoUseCase = new ConsultarCertificadoUseCase(this.nuvemFiscalService);
    this.cadastrarCertificadoBase64UseCase = new CadastrarCertificadoBase64UseCase(this.nuvemFiscalService);
    this.uploadCertificadoUseCase = new UploadCertificadoUseCase(this.nuvemFiscalService);
    this.deletarCertificadoUseCase = new DeletarCertificadoUseCase(this.nuvemFiscalService);
  }

  // ============================================
  // CNPJ
  // ============================================

  /**
   * POST /api/v1/nuvem-fiscal/cnpj/consultar
   * Consulta dados completos de um CNPJ
   */
  async consultarCNPJ(c: Context) {
    try {
      const body = await c.req.json();

      const validacao = consultarCNPJSchema.safeParse(body);
      if (!validacao.success) {
        return c.json({ success: false, error: 'Dados invalidos', details: validacao.error.errors }, 400);
      }

      const resultado = await this.consultarCNPJUseCase.execute(validacao.data);

      return c.json(resultado, resultado.success ? 200 : this.getStatusCode(resultado.error));
    } catch (error: any) {
      console.error('[NUVEM_FISCAL] Erro em consultarCNPJ:', error);
      return c.json({ success: false, error: 'Erro interno', details: error.message }, 500);
    }
  }

  // ============================================
  // EMPRESA
  // ============================================

  async listarEmpresas(c: Context) {
    try {
      const query = c.req.query();
      const params = {
        $top: query.$top ? parseInt(query.$top) : undefined,
        $skip: query.$skip ? parseInt(query.$skip) : undefined,
        $inlinecount: query.$inlinecount === 'true',
        cpf_cnpj: query.cpf_cnpj,
        nome_razao_social: query.nome_razao_social,
      };

      const resultado = await this.listarEmpresasUseCase.execute(params);
      return c.json(resultado, resultado.success ? 200 : this.getStatusCode(resultado.error));
    } catch (error: any) {
      console.error('[NUVEM_FISCAL] Erro em listarEmpresas:', error);
      return c.json({ success: false, error: 'Erro interno', details: error.message }, 500);
    }
  }

  async cadastrarEmpresa(c: Context) {
    try {
      const body = await c.req.json();

      const validacao = empresaSchema.safeParse(body);
      if (!validacao.success) {
        return c.json({ success: false, error: 'Dados invalidos', details: validacao.error.errors }, 400);
      }

      const resultado = await this.cadastrarEmpresaUseCase.execute(validacao.data);
      return c.json(resultado, resultado.success ? 200 : this.getStatusCode(resultado.error));
    } catch (error: any) {
      console.error('[NUVEM_FISCAL] Erro em cadastrarEmpresa:', error);
      return c.json({ success: false, error: 'Erro interno', details: error.message }, 500);
    }
  }

  async consultarEmpresa(c: Context) {
    try {
      const { cpf_cnpj } = c.req.param();
      const resultado = await this.consultarEmpresaUseCase.execute(cpf_cnpj);
      return c.json(resultado, resultado.success ? 200 : this.getStatusCode(resultado.error));
    } catch (error: any) {
      console.error('[NUVEM_FISCAL] Erro em consultarEmpresa:', error);
      return c.json({ success: false, error: 'Erro interno', details: error.message }, 500);
    }
  }

  async alterarEmpresa(c: Context) {
    try {
      const { cpf_cnpj } = c.req.param();
      const body = await c.req.json();

      const validacao = empresaSchema.safeParse(body);
      if (!validacao.success) {
        return c.json({ success: false, error: 'Dados invalidos', details: validacao.error.errors }, 400);
      }

      const resultado = await this.alterarEmpresaUseCase.execute(cpf_cnpj, validacao.data);
      return c.json(resultado, resultado.success ? 200 : this.getStatusCode(resultado.error));
    } catch (error: any) {
      console.error('[NUVEM_FISCAL] Erro em alterarEmpresa:', error);
      return c.json({ success: false, error: 'Erro interno', details: error.message }, 500);
    }
  }

  async deletarEmpresa(c: Context) {
    try {
      const { cpf_cnpj } = c.req.param();
      const resultado = await this.deletarEmpresaUseCase.execute(cpf_cnpj);
      return c.json(resultado, resultado.success ? 200 : this.getStatusCode(resultado.error));
    } catch (error: any) {
      console.error('[NUVEM_FISCAL] Erro em deletarEmpresa:', error);
      return c.json({ success: false, error: 'Erro interno', details: error.message }, 500);
    }
  }

  // ============================================
  // CERTIFICADO
  // ============================================

  async listarCertificados(c: Context) {
    try {
      const query = c.req.query();
      const params = {
        $top: query.$top ? parseInt(query.$top) : undefined,
        $skip: query.$skip ? parseInt(query.$skip) : undefined,
        $inlinecount: query.$inlinecount === 'true',
        expires_in: query.expires_in ? parseInt(query.expires_in) : undefined,
        include_expired: query.include_expired !== 'false',
      };

      const resultado = await this.listarCertificadosUseCase.execute(params);
      return c.json(resultado, resultado.success ? 200 : this.getStatusCode(resultado.error));
    } catch (error: any) {
      console.error('[NUVEM_FISCAL] Erro em listarCertificados:', error);
      return c.json({ success: false, error: 'Erro interno', details: error.message }, 500);
    }
  }

  async consultarCertificado(c: Context) {
    try {
      const { cpf_cnpj } = c.req.param();
      const resultado = await this.consultarCertificadoUseCase.execute(cpf_cnpj);
      return c.json(resultado, resultado.success ? 200 : this.getStatusCode(resultado.error));
    } catch (error: any) {
      console.error('[NUVEM_FISCAL] Erro em consultarCertificado:', error);
      return c.json({ success: false, error: 'Erro interno', details: error.message }, 500);
    }
  }

  async cadastrarCertificadoBase64(c: Context) {
    try {
      const { cpf_cnpj } = c.req.param();
      const body = await c.req.json();

      const validacao = cadastrarCertificadoBase64Schema.safeParse(body);
      if (!validacao.success) {
        return c.json({ success: false, error: 'Dados invalidos', details: validacao.error.errors }, 400);
      }

      const resultado = await this.cadastrarCertificadoBase64UseCase.execute(cpf_cnpj, validacao.data);
      return c.json(resultado, resultado.success ? 200 : this.getStatusCode(resultado.error));
    } catch (error: any) {
      console.error('[NUVEM_FISCAL] Erro em cadastrarCertificadoBase64:', error);
      return c.json({ success: false, error: 'Erro interno', details: error.message }, 500);
    }
  }

  async deletarCertificado(c: Context) {
    try {
      const { cpf_cnpj } = c.req.param();
      const resultado = await this.deletarCertificadoUseCase.execute(cpf_cnpj);
      return c.json(resultado, resultado.success ? 200 : this.getStatusCode(resultado.error));
    } catch (error: any) {
      console.error('[NUVEM_FISCAL] Erro em deletarCertificado:', error);
      return c.json({ success: false, error: 'Erro interno', details: error.message }, 500);
    }
  }

  // ============================================
  // CONFIGURACOES
  // ============================================

  async consultarConfiguracaoCTe(c: Context) {
    try {
      const { cpf_cnpj } = c.req.param();
      const resultado = await this.nuvemFiscalService.consultarConfiguracaoCTe(cpf_cnpj);
      return c.json(resultado, resultado.success ? 200 : this.getStatusCode(resultado.error));
    } catch (error: any) {
      console.error('[NUVEM_FISCAL] Erro em consultarConfiguracaoCTe:', error);
      return c.json({ success: false, error: 'Erro interno', details: error.message }, 500);
    }
  }

  async alterarConfiguracaoCTe(c: Context) {
    try {
      const { cpf_cnpj } = c.req.param();
      const body = await c.req.json();

      const validacao = configuracaoCTeSchema.safeParse(body);
      if (!validacao.success) {
        return c.json({ success: false, error: 'Dados invalidos', details: validacao.error.errors }, 400);
      }

      const resultado = await this.nuvemFiscalService.alterarConfiguracaoCTe(
        cpf_cnpj,
        validacao.data as ConfiguracaoCTe
      );
      return c.json(resultado, resultado.success ? 200 : this.getStatusCode(resultado.error));
    } catch (error: any) {
      console.error('[NUVEM_FISCAL] Erro em alterarConfiguracaoCTe:', error);
      return c.json({ success: false, error: 'Erro interno', details: error.message }, 500);
    }
  }

  // ============================================
  // UTILITARIOS
  // ============================================

  private getStatusCode(error?: string): ContentfulStatusCode {
    if (!error) return 500;
    if (error.includes('invalido')) return 400;
    if (error.includes('nao encontrado') || error.includes('nao autenticado')) return 404;
    if (error.includes('Nao autenticado')) return 401;
    if (error.includes('Limite')) return 429;
    return 500;
  }
}
