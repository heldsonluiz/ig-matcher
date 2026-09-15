# Roadmap do Instagram Matcher

Este arquivo acompanha a implementacao do Instagram Connections Analyzer. Marque uma atividade como concluida somente quando ela estiver implementada, testada e validada conforme o `AGENTS.md`.

## Status geral

- **Concluido:** etapas 1, 2 e 3.
- **Em andamento:** nenhuma etapa no momento.
- **Proximo incremento recomendado:** etapa 4, parser da exportacao e normalizacao dos registros.
- **Fora do escopo:** login, scraping, APIs privadas, automacao de acoes no Instagram, backend, nuvem e sincronizacao entre dispositivos.

## Etapas

### 1. Base do projeto, tema e shell — Concluida

- [x] Configurar Next.js App Router, TypeScript estrito, Tailwind, shadcn/ui, ESLint, Prettier, Vitest e Playwright.
- [x] Criar tema claro, escuro e sistema.
- [x] Criar shell responsivo com navegacao para Importacao, Dashboard, Historico e Configuracoes.
- [x] Criar a home com orientacoes de privacidade e o estado inicial das rotas.
- [x] Adicionar teste de componente do shell e smoke test do Playwright.

**Observacao:** o smoke test foi configurado, mas a execucao local depende da biblioteca nativa `libnspr4.so` para iniciar o Chromium neste ambiente.

### 2. Tipos, schemas e fixtures — Concluida

- [x] Definir `InstagramProfile`, `ImportedDataset`, `InstagramSnapshot` e estados de dataset.
- [x] Criar schemas Zod para registros da Meta, envelopes conhecidos, datasets e snapshots.
- [x] Implementar normalizacao de usernames e deduplicacao por username normalizado.
- [x] Criar fixtures JSON totalmente ficticias para lista na raiz, envelope `relationships_following` e entrada invalida.
- [x] Criar testes unitarios de validacao, normalizacao, estados vazio/nao fornecido e duplicatas.

### 3. Leitura segura do ZIP e descoberta de arquivos — Concluida

Adicionar a leitura do arquivo `.zip` exclusivamente no navegador usando JSZip. Descobrir arquivos pelo nome-base, sem depender do caminho completo, reconhecer partes numeradas de seguidores e seguindo e limitar tamanho, quantidade de arquivos, volume descompactado e profundidade para reduzir risco de ZIP bomb.

**Entregas realizadas:** `discover-files.ts`, leitura textual limitada dos arquivos relevantes e testes de descoberta em caminhos variados, ZIP invalido e limites de seguranca.

### 4. Parser da exportacao e normalizacao dos registros — Pendente

Converter os JSONs descobertos para o modelo interno. Suportar listas na raiz, envelopes como `relationships_following` e entradas em `string_list_data`, tolerar arquivos opcionais invalidos sem interromper a importacao e produzir avisos compreensiveis.

**Entregas esperadas:** `parse-export.ts`, `normalize-entry.ts` completo, estados `available`, `empty`, `not_provided` e `invalid`, alem de testes para cada envelope suportado e JSON invalido.

### 5. Resumo e confirmacao da importacao — Pendente

Criar o fluxo de selecao e remocao do ZIP, arrastar e soltar, validacao de extensao e limite, progresso por etapas, cancelamento antes de salvar e resumo antes da confirmacao.

O resumo deve mostrar contagens, arquivos encontrados, conjuntos nao fornecidos, avisos, arquivos parcialmente ignorados e duplicatas removidas. Reimportacoes equivalentes devem gerar aviso e permitir substituir ou cancelar.

### 6. Persistencia local de snapshots — Pendente

Implementar IndexedDB, preferencialmente com `idb`, para salvar e recuperar varios snapshots sem enviar dados pela rede. Armazenar datasets normalizados, avisos, identificacao local, datas, arquivo de origem, conta e assinatura/hash para detectar duplicatas.

**Entregas esperadas:** `db.ts` ou `repository.ts`, operacoes de criar, listar, buscar, atualizar, excluir e apagar tudo, com testes de persistencia quando aplicavel.

### 7. Calculos de relacoes e dashboard — Pendente

Implementar funcoes puras para intersecao e diferencas usando usernames normalizados:

- `mutuals = followers ∩ following`;
- `notFollowingBack = following - followers`;
- `notFollowedBackByMe = followers - following`.

Criar o dashboard com contagens, metadados do snapshot, seletor de snapshot, avisos e estados indisponiveis sem converter dados ausentes em zero.

### 8. Listas de conexoes — Pendente

Criar as telas de seguidores, seguindo, conexoes mutuas e relacoes unilaterais. Incluir busca, ordenacao alfabetica e por timestamp quando disponivel, indicacao de relacao, links externos seguros e paginacao ou virtualizacao para listas grandes.

### 9. Solicitacoes pendentes — Pendente

Processar e exibir solicitacoes enviadas e, quando o arquivo existir, solicitacoes recebidas. Diferenciar claramente arquivo ausente de lista vazia, mostrar timestamp quando houver e informar que a aplicacao nao cancela solicitacoes automaticamente.

### 10. Historico e comparacao de snapshots — Pendente

Criar a tela de historico com abertura, identificacao amigavel, exclusao individual e exclusao total com confirmacao. Comparar snapshots da mesma conta e do mesmo tipo, mostrando adicoes e remocoes sem afirmar causas que os dados nao comprovam.

Informar datas, nomes e conjuntos nao fornecidos; impedir comparacoes silenciosas entre contas diferentes identificaveis.

### 11. Exportacao de resultados — Pendente

Permitir exportar listas filtradas em CSV UTF-8 e JSON. Incluir username, URL, timestamp original quando disponivel, categoria e data do snapshot. Cobrir caracteres especiais e filtros ativos com testes unitarios.

### 12. Configuracoes, privacidade e dados locais — Pendente

Completar a tela de configuracoes com tema, uso aproximado de armazenamento, exclusao de snapshots, apagamento reforcado de todos os dados, informacoes de privacidade, limitacoes e versao da aplicacao.

O seletor inicial de tema ja existe na etapa 1; esta etapa deve integrar as configuracoes ao restante dos dados locais.

### 13. Testes de ponta a ponta, acessibilidade e revisao responsiva — Pendente

Completar os fluxos E2E com fixture ficticia: importar, confirmar, abrir dashboard, navegar pelas categorias, salvar dois snapshots, comparar, recarregar e apagar dados. Validar rejeicao de ZIP invalido, estados vazios e mensagens de arquivo ausente.

Revisar teclado, foco, contraste, `prefers-reduced-motion`, mobile/desktop, console sem erros e instalacao das dependencias nativas necessarias para executar o Playwright no ambiente de CI.

## Checklist por incremento

Antes de considerar uma etapa concluida:

- [ ] Escopo da etapa implementado sem antecipar funcionalidades posteriores.
- [ ] Estados inicial, carregamento, sucesso, vazio, nao fornecido e erro tratados quando aplicavel.
- [ ] Dados continuam locais e nenhum login, senha, cookie ou token e solicitado.
- [ ] Testes relevantes adicionados com fixtures ficticias.
- [ ] `npm run lint` executado.
- [ ] `npm run typecheck` executado.
- [ ] `npm run test:run` executado.
- [ ] `npm run build` executado quando houver alteracao de aplicacao ou configuracao.
- [ ] Documentacao e este roadmap atualizados quando houver nova decisao.

## Proxima sequencia sugerida

1. Implementar descoberta e leitura segura dos arquivos do ZIP.
2. Completar o parser dos envelopes da Meta e conectar a normalizacao existente.
3. Construir o fluxo de resumo e confirmacao da importacao.
4. Persistir o primeiro snapshot no IndexedDB.
5. Ativar calculos e dashboard somente depois de existir um snapshot valido.
