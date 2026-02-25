/**
 * Fiscal Module - Schema Index
 * Re-exports all fiscal database schemas.
 */

// Configurações e Infraestrutura
export {
  fiscalSettings,
  digitalCertificates,
  trustedSuppliers,
  fiscalAuditLogs,
} from './fiscal-config';

// DF-e Inbox (Documentos Recebidos)
export {
  dfeInboxDocuments,
  dfeInboxItems,
  supplierProductMapping,
  dfeManifestations,
  dfeProcessingQueue,
} from './dfe-inbox';

// DF-e Emitidos (Documentos Emitidos)
export {
  dfeEmitidos,
  dfeEmitidoItems,
  dfeEmitidoEvents,
} from './dfe-emitidos';

// GNRE e ADRC-ST
export {
  gnreGuias,
  adrcstArquivos,
  adrcstProdutos,
} from './gnre-adrcst';
