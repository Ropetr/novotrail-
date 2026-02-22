## Padrao de resposta da API

Este padrao ajuda o frontend a sempre tratar erros e sucesso da mesma forma.

### Sucesso
```json
{
  "success": true,
  "data": { ... }
}
```

### Erro
```json
{
  "success": false,
  "error": "Mensagem simples para o usuario",
  "details": "Opcional, para debug"
}
```

### Observacao
Hoje nem todos os controllers seguem este padrao.
O objetivo e migrar gradualmente cada modulo para este formato.

