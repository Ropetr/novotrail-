/**
 * Fiscal Validator Service
 * Validações fiscais reutilizáveis em todo o módulo fiscal.
 */

export class FiscalValidator {
  /**
   * Valida chave de acesso NF-e/CT-e (44 dígitos)
   */
  static validarChaveAcesso(chave: string): { valida: boolean; erro?: string } {
    const chaveLimpa = chave.replace(/\D/g, '');
    if (chaveLimpa.length !== 44) {
      return { valida: false, erro: 'Chave de acesso deve ter 44 dígitos' };
    }

    // Extrair componentes
    const cUF = chaveLimpa.substring(0, 2);
    const AAMM = chaveLimpa.substring(2, 6);
    const CNPJ = chaveLimpa.substring(6, 20);
    const mod = chaveLimpa.substring(20, 22);
    const serie = chaveLimpa.substring(22, 25);
    const nNF = chaveLimpa.substring(25, 34);
    const tpEmis = chaveLimpa.substring(34, 35);
    const cNF = chaveLimpa.substring(35, 43);
    const cDV = chaveLimpa.substring(43, 44);

    // Validar UF
    const ufsValidas = [
      '11', '12', '13', '14', '15', '16', '17', '21', '22', '23', '24', '25',
      '26', '27', '28', '29', '31', '32', '33', '35', '41', '42', '43', '50',
      '51', '52', '53',
    ];
    if (!ufsValidas.includes(cUF)) {
      return { valida: false, erro: `Código UF inválido: ${cUF}` };
    }

    // Validar modelo (55=NF-e, 57=CT-e, 65=NFC-e, 67=CT-e OS)
    const modelosValidos = ['55', '57', '65', '67'];
    if (!modelosValidos.includes(mod)) {
      return { valida: false, erro: `Modelo inválido: ${mod}` };
    }

    // Validar dígito verificador (módulo 11)
    const digitoCalculado = this.calcularDVChaveAcesso(chaveLimpa.substring(0, 43));
    if (digitoCalculado.toString() !== cDV) {
      return { valida: false, erro: 'Dígito verificador inválido' };
    }

    return { valida: true };
  }

  /**
   * Calcula dígito verificador da chave de acesso (módulo 11)
   */
  static calcularDVChaveAcesso(chave43: string): number {
    const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
    let soma = 0;
    let pesoIdx = 0;

    for (let i = chave43.length - 1; i >= 0; i--) {
      soma += parseInt(chave43[i]) * pesos[pesoIdx];
      pesoIdx = (pesoIdx + 1) % pesos.length;
    }

    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  }

  /**
   * Valida CNPJ
   */
  static validarCNPJ(cnpj: string): boolean {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false;

    let tamanho = cnpjLimpo.length - 2;
    let numeros = cnpjLimpo.substring(0, tamanho);
    let digitos = cnpjLimpo.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho = tamanho + 1;
    numeros = cnpjLimpo.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(digitos.charAt(1));
  }

  /**
   * Valida CPF
   */
  static validarCPF(cpf: string): boolean {
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpfLimpo.charAt(10));
  }

  /**
   * Valida NCM (8 dígitos)
   */
  static validarNCM(ncm: string): boolean {
    const ncmLimpo = ncm.replace(/\D/g, '');
    return ncmLimpo.length === 8;
  }

  /**
   * Valida CEST (7 dígitos)
   */
  static validarCEST(cest: string): boolean {
    const cestLimpo = cest.replace(/\D/g, '');
    return cestLimpo.length === 7;
  }

  /**
   * Valida CFOP (4 dígitos)
   */
  static validarCFOP(cfop: string): { valido: boolean; tipo?: string; erro?: string } {
    const cfopLimpo = cfop.replace(/\D/g, '');
    if (cfopLimpo.length !== 4) {
      return { valido: false, erro: 'CFOP deve ter 4 dígitos' };
    }

    const primeiro = parseInt(cfopLimpo[0]);
    const tipos: Record<number, string> = {
      1: 'entrada_estadual',
      2: 'entrada_interestadual',
      3: 'entrada_exterior',
      5: 'saida_estadual',
      6: 'saida_interestadual',
      7: 'saida_exterior',
    };

    if (!tipos[primeiro]) {
      return { valido: false, erro: `Primeiro dígito CFOP inválido: ${primeiro}` };
    }

    return { valido: true, tipo: tipos[primeiro] };
  }

  /**
   * Determina se CFOP é de entrada ou saída
   */
  static cfopEhEntrada(cfop: string): boolean {
    const primeiro = parseInt(cfop[0]);
    return [1, 2, 3].includes(primeiro);
  }

  /**
   * Valida Inscrição Estadual (formato genérico)
   */
  static validarIE(ie: string, uf: string): boolean {
    const ieLimpa = ie.replace(/\D/g, '');
    if (ieLimpa === '' || ieLimpa === 'ISENTO') return true;

    // Validação básica por tamanho (cada UF tem regras específicas)
    const tamanhoPorUF: Record<string, number[]> = {
      AC: [13], AL: [9], AP: [9], AM: [9], BA: [8, 9], CE: [9],
      DF: [13], ES: [9], GO: [9], MA: [9], MT: [11], MS: [9],
      MG: [13], PA: [9], PB: [9], PR: [10], PE: [14], PI: [9],
      RJ: [8], RN: [9, 10], RS: [10], RO: [14], RR: [9],
      SC: [9], SP: [12], SE: [9], TO: [11],
    };

    const tamanhos = tamanhoPorUF[uf];
    if (!tamanhos) return true; // UF desconhecida, aceita
    return tamanhos.includes(ieLimpa.length);
  }

  /**
   * Valida código de evento de manifestação
   */
  static validarCodigoManifestacao(codigo: string): {
    valido: boolean;
    tipo?: string;
    erro?: string;
  } {
    const codigos: Record<string, string> = {
      '210200': 'ciencia',
      '210210': 'confirmacao',
      '210220': 'desconhecimento',
      '210240': 'nao_realizada',
    };

    if (!codigos[codigo]) {
      return { valido: false, erro: `Código de manifestação inválido: ${codigo}` };
    }

    return { valido: true, tipo: codigos[codigo] };
  }

  /**
   * Extrai informações da chave de acesso
   */
  static extrairDadosChaveAcesso(chave: string): {
    uf: string;
    anoMes: string;
    cnpj: string;
    modelo: string;
    serie: string;
    numero: string;
    tipoEmissao: string;
    codigoNumerico: string;
    digitoVerificador: string;
  } {
    const c = chave.replace(/\D/g, '');
    return {
      uf: c.substring(0, 2),
      anoMes: c.substring(2, 6),
      cnpj: c.substring(6, 20),
      modelo: c.substring(20, 22),
      serie: c.substring(22, 25),
      numero: c.substring(25, 34),
      tipoEmissao: c.substring(34, 35),
      codigoNumerico: c.substring(35, 43),
      digitoVerificador: c.substring(43, 44),
    };
  }

  /**
   * Código UF para sigla
   */
  static codigoUFParaSigla(codigo: string): string {
    const mapa: Record<string, string> = {
      '11': 'RO', '12': 'AC', '13': 'AM', '14': 'RR', '15': 'PA',
      '16': 'AP', '17': 'TO', '21': 'MA', '22': 'PI', '23': 'CE',
      '24': 'RN', '25': 'PB', '26': 'PE', '27': 'AL', '28': 'SE',
      '29': 'BA', '31': 'MG', '32': 'ES', '33': 'RJ', '35': 'SP',
      '41': 'PR', '42': 'SC', '43': 'RS', '50': 'MS', '51': 'MT',
      '52': 'GO', '53': 'DF',
    };
    return mapa[codigo] || '';
  }
}
