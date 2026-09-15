# Roadmap do Instagram Matcher

Este arquivo acompanha a implementacao do Instagram Connections Analyzer. Marque uma atividade como concluida somente quando ela estiver implementada, testada e validada conforme o `AGENTS.md`.

## Status geral

- **Concluido:** etapas 1, 2, 3, 4, 5, 6 e 7.
- **Em andamento:** nenhuma etapa no momento.
- **Proximo incremento recomendado:** etapa 8, listas de conexoes.
- **Fora do escopo:** login, scraping, APIs privadas, automacao de acoes no Instagram, backend, nuvem e sincronizacao entre dispositivos.

## Etapas

### 1. Base do projeto, tema e shell — Concluida

- [x] Configurar Next.js App Router, TypeScript estrito, Tailwind, shadcn/ui, ESLint, Prettier, Vitest e Playwright.
- [x] Criar tema claro, escuro e sistema.
- [x] Criar shell responsivo com navegacao para Importacao, Dashboard, Historico e Configuracoes.
- [x] Criar a home com orientacoes de privacidade e o estado inicial das rotas.
- [x] Adicionar teste de componente do shell e smoke test do Playwright.

**Observacao:** as dependencias nativas do Chromium estao disponiveis e o smoke test passou em 2026-09-15. Em um novo ambiente Linux, executar `npx playwright install-deps chromium` no terminal e depois `npm run test:e2e`. O proprio Playwright solicita autenticacao de administrador quando necessario; nao prefixar o comando com `sudo`, pois o ambiente do administrador pode nao encontrar o `npx`.

### 2. Tipos, schemas e fixtures — Concluida

- [x] Definir `InstagramProfile`, `ImportedDataset`, `InstagramSnapshot` e estados de dataset.
- [x] Criar schemas Zod para registros da Meta, envelopes conhecidos, datasets e snapshots.
- [x] Implementar normalizacao de usernames e deduplicacao por username normalizado.
- [x] Criar fixtures JSON totalmente ficticias para lista na raiz, envelope `relationships_following` e entrada invalida.
- [x] Criar testes unitarios de validacao, normalizacao, estados vazio/nao fornecido e duplicatas.

### 3. Leitura segura do ZIP e descoberta de arquivos — Concluida

Adicionar a leitura do arquivo `.zip` exclusivamente no navegador usando JSZip. Descobrir arquivos pelo nome-base, sem depender do caminho completo, reconhecer partes numeradas de seguidores e seguindo e limitar tamanho, quantidade de arquivos, volume descompactado e profundidade para reduzir risco de ZIP bomb.

**Entregas realizadas:** `discover-files.ts`, leitura textual limitada dos arquivos relevantes e testes de descoberta em caminhos variados, ZIP invalido e limites de seguranca.

### 4. Parser da exportacao e normalizacao dos registros — Concluida

Converter os JSONs descobertos para o modelo interno. Suportar listas na raiz, envelopes como `relationships_following` e entradas em `string_list_data`, tolerar arquivos opcionais invalidos sem interromper a importacao e produzir avisos compreensiveis.

**Entregas realizadas:** `parse-export.ts`, normalizacao por username, estados `available`, `empty`, `not_provided` e `invalid`, avisos de entradas ignoradas e testes para envelopes, JSON invalido, partes agregadas e duplicatas. O parser tambem aceita `following` sem `value` e solicitacoes no formato `label_values` encontrado em exportacoes reais.

### 5. Resumo e confirmacao da importacao — Concluida

Criar o fluxo de selecao e remocao do ZIP, arrastar e soltar, validacao de extensao e limite, progresso por etapas, cancelamento antes de salvar e resumo antes da confirmacao.

O resumo deve mostrar contagens, arquivos encontrados, conjuntos nao fornecidos, avisos, arquivos parcialmente ignorados e duplicatas removidas. Reimportacoes equivalentes devem gerar aviso e permitir substituir ou cancelar.

**Entregas realizadas:** fluxo cliente em `import-workflow.tsx`, seleção e arrastar/soltar, processamento local com progresso, resumo por dataset, avisos, duplicatas, cancelamento e confirmação antes do futuro salvamento. A persistência continua reservada à etapa 6.

### 6. Persistencia local de snapshots — Concluida

Implementar IndexedDB, preferencialmente com `idb`, para salvar e recuperar varios snapshots sem enviar dados pela rede. Armazenar datasets normalizados, avisos, identificacao local, datas, arquivo de origem, conta e assinatura/hash para detectar duplicatas.

**Entregas realizadas:** `repository.ts` e `types.ts` com operacoes de salvar, listar, buscar, renomear, excluir e apagar snapshots, assinatura deterministica dos conjuntos e testes com IndexedDB simulado. A confirmacao da importacao ja salva o snapshot localmente.

### 7. Calculos de relacoes e dashboard — Concluida

Implementar funcoes puras para intersecao e diferencas usando usernames normalizados:

- `mutuals = followers ∩ following`;
- `notFollowingBack = following - followers`;
- `notFollowedBackByMe = followers - following`.

Criar o dashboard com contagens, metadados do snapshot, seletor de snapshot, avisos e estados indisponiveis sem converter dados ausentes em zero.

**Entregas realizadas:** `calculate-relationships.ts` com testes de conjuntos disponiveis, vazios e nao fornecidos; dashboard conectado ao IndexedDB com selecao de snapshot, carregamento, erro, estado vazio e contagens derivadas.

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

## Validacao de manutencao — 2026-09-15

- Seletor de tema usa o Select do shadcn/ui, com cores do tema, icones e indicador de selecao; a lista abre acima do controle flutuante.
- Identidade visual: app-shell usa `public/icon.png` no tema claro e `public/icon-dark.png` no escuro; favicon usa sempre a versao escura em PNG, substituindo o favicon padrao.
- Dois testes E2E passaram: navegacao principal e alternancia dos icones por tema com favicon escuro. O Playwright agora cria um build de producao e inicia um servidor exclusivo na porta 3100, sem reutilizar o servidor de desenvolvimento.
- Lint, checagem de tipos e 37 testes em 9 arquivos passaram.
- Build de producao passou com cache limpo e permissao para abrir a porta interna do Turbopack; a tentativa no sandbox havia falhado por restricao de permissao.
- Configuracao do Vitest renomeada para `vitest.config.mts` para explicitar ESM e eliminar o aviso de carregamento como CommonJS.
- Artefatos do Playwright (`test-results/` e `playwright-report/`) ignorados pelo Git.
- Smoke test E2E passou no Chromium. Corrigido o seletor ambiguo de `Importacao`, restringindo a busca ao link exato dentro da navegacao principal.
- A etapa 13 continua pendente: o smoke test existente nao cobre os fluxos completos.

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

1. Criar as listas de conexoes com busca, ordenacao, paginacao e links seguros (etapa 8).
2. Completar as telas de solicitacoes enviadas e recebidas (etapa 9).
3. Implementar a interface de historico e a comparacao de snapshots (etapa 10).
4. Exportar listas filtradas em CSV e JSON (etapa 11).
5. Completar configuracoes e gerenciamento de dados locais (etapa 12).
6. Completar os testes E2E e revisar acessibilidade e responsividade (etapa 13).
