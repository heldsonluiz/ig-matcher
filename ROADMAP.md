# Roadmap do Instagram Matcher

Este arquivo acompanha a implementação do Instagram Connections Analyzer. Marque uma atividade como concluída somente quando ela estiver implementada, testada e validada conforme o `AGENTS.md`.

## Status geral

- **Concluído:** etapas 1, 2, 3, 4, 5, 6, 7 e 8.
- **Parcialmente concluída:** etapa 9, solicitações enviadas implementadas; recebidas pendentes.
- **Próximo incremento recomendado:** completar etapa 9 com solicitações recebidas.
- **Fora do escopo:** login, scraping, APIs privadas, automação de ações no Instagram, backend, nuvem e sincronização entre dispositivos.

## Etapas

### 1. Base do projeto, tema e shell — Concluída

- [x] Configurar Next.js App Router, TypeScript estrito, Tailwind, shadcn/ui, ESLint, Prettier, Vitest e Playwright.
- [x] Criar tema claro, escuro e sistema.
- [x] Criar shell responsivo com navegação para Importação, Dashboard, Histórico e Configurações.
- [x] Criar a home com orientações de privacidade e o estado inicial das rotas.
- [x] Adicionar teste de componente do shell e smoke test do Playwright.

**Observação:** as dependências nativas do Chromium estão disponíveis e o smoke test passou em 2026-09-15. Em um novo ambiente Linux, executar `npx playwright install-deps chromium` no terminal e depois `npm run test:e2e`. O próprio Playwright solicita autenticação de administrador quando necessário; não prefixar o comando com `sudo`, pois o ambiente do administrador pode não encontrar o `npx`.

### 2. Tipos, schemas e fixtures — Concluída

- [x] Definir `InstagramProfile`, `ImportedDataset`, `InstagramSnapshot` e estados de dataset.
- [x] Criar schemas Zod para registros da Meta, envelopes conhecidos, datasets e snapshots.
- [x] Implementar normalização de usernames e deduplicação por username normalizado.
- [x] Criar fixtures JSON totalmente fictícias para lista na raiz, envelope `relationships_following` e entrada inválida.
- [x] Criar testes unitários de validação, normalização, estados vazio/não fornecido e duplicatas.

### 3. Leitura segura do ZIP e descoberta de arquivos — Concluída

Adicionar a leitura do arquivo `.zip` exclusivamente no navegador usando JSZip. Descobrir arquivos pelo nome-base, sem depender do caminho completo, reconhecer partes numeradas de seguidores e seguindo e limitar tamanho, quantidade de arquivos, volume descompactado e profundidade para reduzir risco de ZIP bomb.

**Entregas realizadas:** `discover-files.ts`, leitura textual limitada dos arquivos relevantes e testes de descoberta em caminhos variados, ZIP inválido e limites de segurança.

### 4. Parser da exportação e normalização dos registros — Concluída

Converter os JSONs descobertos para o modelo interno. Suportar listas na raiz, envelopes como `relationships_following` e entradas em `string_list_data`, tolerar arquivos opcionais inválidos sem interromper a importação e produzir avisos compreensíveis.

**Entregas realizadas:** `parse-export.ts`, normalização por username, estados `available`, `empty`, `not_provided` e `invalid`, avisos de entradas ignoradas e testes para envelopes, JSON inválido, partes agregadas e duplicatas. O parser também aceita `following` sem `value` e solicitações no formato `label_values` encontrado em exportações reais.

### 5. Resumo e confirmação da importação — Concluída

Criar o fluxo de seleção e remoção do ZIP, arrastar e soltar, validação de extensão e limite, progresso por etapas, cancelamento antes de salvar e resumo antes da confirmação.

O resumo deve mostrar contagens, arquivos encontrados, conjuntos não fornecidos, avisos, arquivos parcialmente ignorados e duplicatas removidas. Reimportações equivalentes devem gerar aviso e permitir substituir ou cancelar.

**Entregas realizadas:** fluxo cliente em `import-workflow.tsx`, seleção e arrastar/soltar, processamento local com progresso, resumo por dataset, avisos, duplicatas, cancelamento e confirmação antes do futuro salvamento. A persistência continua reservada à etapa 6.

### 6. Persistência local de snapshots — Concluída

Implementar IndexedDB, preferencialmente com `idb`, para salvar e recuperar vários snapshots sem enviar dados pela rede. Armazenar datasets normalizados, avisos, identificação local, datas, arquivo de origem, conta e assinatura/hash para detectar duplicatas.

**Entregas realizadas:** `repository.ts` e `types.ts` com operações de salvar, listar, buscar, renomear, excluir e apagar snapshots, assinatura determinística dos conjuntos e testes com IndexedDB simulado. A confirmação da importação já salva o snapshot localmente.

### 7. Cálculos de relações e dashboard — Concluída

Implementar funções puras para interseção e diferenças usando usernames normalizados:

- `mutuals = followers ∩ following`;
- `notFollowingBack = following - followers`;
- `notFollowedBackByMe = followers - following`.

Criar o dashboard com contagens, metadados do snapshot, seletor de snapshot, avisos e estados indisponíveis sem converter dados ausentes em zero.

**Entregas realizadas:** `calculate-relationships.ts` com testes de conjuntos disponíveis, vazios e não fornecidos; dashboard conectado ao IndexedDB com seleção de snapshot, carregamento, erro, estado vazio e contagens derivadas.

### 8. Listas de conexões — Concluída

Criar as telas de seguidores, seguindo, conexões mútuas e relações unilaterais. Incluir busca, ordenação alfabética e por timestamp quando disponível, indicação de relação, links externos seguros e paginação ou virtualização para listas grandes.

**Entregas realizadas:** rota `/connections/[category]`, seletores puros e lista compartilhada para as cinco categorias, busca por username, ordenação A–Z/Z–A e por data, paginação de 50 perfis, indicação de reciprocidade e links HTTPS para o Instagram. Datas ausentes ficam ao final da ordenação por data. Os cartões do dashboard abrem a lista com o identificador do snapshot na URL; a navegação entre categorias e o retorno ao dashboard preservam essa seleção. Snapshot inexistente não é substituído silenciosamente. Estados de carregamento, erro com nova tentativa, vazio, busca sem resultados, dados ausentes e inválidos possuem mensagens distintas. Exportação CSV/JSON permanece na etapa 11.

**Validação:** lint, tipos, build, 48 testes unitários/componentes e 4 E2E passaram. Os novos fluxos E2E importam ZIP sintético, conferem categorias, busca, ordenação, paginação, teclado, recarga do IndexedDB e retorno ao dashboard em viewports de 1280px e 390px, sem exceções JavaScript ou transbordamento horizontal.

### 9. Solicitações pendentes — Parcialmente concluída

Processar e exibir solicitações enviadas e, quando o arquivo existir, solicitações recebidas. Diferenciar claramente arquivo ausente de lista vazia, mostrar timestamp quando houver e informar que a aplicação não cancela solicitações automaticamente.

**Incremento realizado:** solicitações enviadas disponíveis em `/connections/pending-sent`, pelo card do dashboard e navegação das categorias. A lista usa exclusivamente `pendingSentRequests`, com busca, ordenação por nome/data, paginação e status de solicitação pendente; arquivo ausente, vazio e inválido são distintos. Solicitações recebidas continuam pendentes. Linhas das tabelas receberam espaçamento vertical de 12px por célula.

### 10. Histórico e comparação de snapshots — Pendente

Criar a tela de histórico com abertura, identificação amigável, exclusão individual e exclusão total com confirmação. Comparar snapshots da mesma conta e do mesmo tipo, mostrando adições e remoções sem afirmar causas que os dados não comprovam.

Informar datas, nomes e conjuntos não fornecidos; impedir comparações silenciosas entre contas diferentes identificáveis.

### 11. Exportação de resultados — Pendente

Permitir exportar listas filtradas em CSV UTF-8 e JSON. Incluir username, URL, timestamp original quando disponível, categoria e data do snapshot. Cobrir caracteres especiais e filtros ativos com testes unitários.

### 12. Configurações, privacidade e dados locais — Pendente

Completar a tela de configurações com tema, uso aproximado de armazenamento, exclusão de snapshots, apagamento reforçado de todos os dados, informações de privacidade, limitações e versão da aplicação.

O seletor inicial de tema já existe na etapa 1; esta etapa deve integrar as configurações ao restante dos dados locais.

### 13. Testes de ponta a ponta, acessibilidade e revisão responsiva — Pendente

Completar os fluxos E2E com fixture fictícia: importar, confirmar, abrir dashboard, navegar pelas categorias, salvar dois snapshots, comparar, recarregar e apagar dados. Validar rejeição de ZIP inválido, estados vazios e mensagens de arquivo ausente.

Revisar teclado, foco, contraste, `prefers-reduced-motion`, mobile/desktop, console sem erros e instalação das dependências nativas necessárias para executar o Playwright no ambiente de CI.

## Validação de manutenção — 2026-09-15

- Revisados os textos em português da interface, mensagens de importação e testes, com correções de ortografia, acentuação e crase. Roadmap revisado para manter a mesma escrita.
- Navegação das listas: cards do dashboard mostram "Ver lista", seta e destaque no hover/foco. Listagem compacta em tabela com colunas de número, perfil, relação e data, numeração contínua entre páginas (conforme busca e ordenação) e paginação no topo e rodapé. Em telas estreitas, a tabela possui rolagem horizontal própria.
- Seletor de tema usa o Select do shadcn/ui, com cores do tema, ícones e indicador de seleção; a lista abre acima do controle flutuante.
- Identidade visual: app-shell usa `public/icon.png` no tema claro e `public/icon-dark.png` no escuro; favicon usa sempre a versão escura em PNG, substituindo o favicon padrão.
- Dois testes E2E passaram: navegação principal e alternância dos ícones por tema com favicon escuro. O Playwright agora cria um build de produção e inicia um servidor exclusivo na porta 3100, sem reutilizar o servidor de desenvolvimento.
- Lint, checagem de tipos e 37 testes em 9 arquivos passaram.
- Build de produção passou com cache limpo e permissão para abrir a porta interna do Turbopack; a tentativa no sandbox havia falhado por restrição de permissão.
- Configuração do Vitest renomeada para `vitest.config.mts` para explicitar ESM e eliminar o aviso de carregamento como CommonJS.
- Artefatos do Playwright (`test-results/` e `playwright-report/`) ignorados pelo Git.
- Smoke test E2E passou no Chromium. Corrigido o seletor ambíguo de `Importação`, restringindo a busca ao link exato dentro da navegação principal.
- A etapa 13 continua pendente: o smoke test existente não cobre os fluxos completos.

## Checklist por incremento

Antes de considerar uma etapa concluída:

- [ ] Escopo da etapa implementado sem antecipar funcionalidades posteriores.
- [ ] Estados inicial, carregamento, sucesso, vazio, não fornecido e erro tratados quando aplicável.
- [ ] Dados continuam locais e nenhum login, senha, cookie ou token é solicitado.
- [ ] Testes relevantes adicionados com fixtures fictícias.
- [ ] `npm run lint` executado.
- [ ] `npm run typecheck` executado.
- [ ] `npm run test:run` executado.
- [ ] `npm run build` executado quando houver alteração de aplicação ou configuração.
- [ ] Documentação e este roadmap atualizados quando houver nova decisão.

## Próxima sequência sugerida

1. Completar as telas de solicitações enviadas e recebidas (etapa 9).
2. Implementar a interface de histórico e a comparação de snapshots (etapa 10).
3. Exportar listas filtradas em CSV e JSON (etapa 11).
4. Completar configurações e gerenciamento de dados locais (etapa 12).
5. Completar os testes E2E e revisar acessibilidade e responsividade (etapa 13).
