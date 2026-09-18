# Roadmap do Unveil

Este arquivo acompanha a implementação do Unveil. Marque uma atividade como concluída somente quando ela estiver implementada, testada e validada conforme o `AGENTS.md`.

## Status geral

- **Concluído:** etapas 1, 2, 3, 4, 5, 6, 7, 8, 9 e 11.
- **Em andamento:** nenhuma etapa no momento.
- **Adiada:** etapa 10, histórico e comparação de snapshots, por solicitação do usuário.
- **Próximo incremento recomendado:** etapa 12, testes de ponta a ponta, acessibilidade e revisão responsiva.
- **Primeira release:** pública e gratuita, com análise local e sem cadastro; concluir a etapa 12 antes do lançamento.
- **Fora do escopo da primeira release:** login, API oficial, backend, cobrança, nuvem e sincronização entre dispositivos. Scraping, APIs privadas e automação de ações no Instagram continuam fora do escopo do produto.
- **Objetivo:** projeto de portfólio público e gratuito; melhorias locais no backlog, sem plano de monetização. O SaaS para pequenos criadores é um projeto separado.

## Etapas

### 1. Base do projeto, tema e shell — Concluída

- [x] Configurar Next.js App Router, TypeScript estrito, Tailwind, shadcn/ui, ESLint, Prettier, Vitest e Playwright.
- [x] Criar identidade visual em tema escuro. O seletor de tema foi removido por decisão posterior do usuário.
- [x] Criar shell responsivo com navegação para Importação e Dashboard (Histórico e Configurações retirados do escopo atual).
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

Implementar IndexedDB, preferencialmente com `idb`, para salvar e recuperar apenas a importação atual sem enviar dados pela rede. Armazenar datasets normalizados, avisos, identificação local, datas, arquivo de origem, conta e assinatura/hash para detectar duplicatas.

**Entregas realizadas:** `repository.ts` e `types.ts` com salvamento atômico, consulta da importação atual e apagamento de dados, assinatura determinística dos conjuntos e testes com IndexedDB simulado. A confirmação da importação já salva o snapshot localmente.

### 7. Cálculos de relações e dashboard — Concluída

Implementar funções puras para interseção e diferenças usando usernames normalizados:

- `mutuals = followers ∩ following`;
- `notFollowingBack = following - followers`;
- `notFollowedBackByMe = followers - following`.

Criar o dashboard com contagens, metadados do snapshot, identificação da importação atual, avisos e estados indisponíveis sem converter dados ausentes em zero.

**Entregas realizadas:** `calculate-relationships.ts` com testes de conjuntos disponíveis, vazios e não fornecidos; dashboard conectado ao IndexedDB com a importação atual, carregamento, erro, estado vazio e contagens derivadas.

### 8. Listas de conexões — Concluída

Criar as telas de seguidores, seguindo, conexões mútuas e relações unilaterais. Incluir busca, ordenação alfabética e por timestamp quando disponível, indicação de relação, links externos seguros e paginação ou virtualização para listas grandes.

**Entregas realizadas:** rota `/connections/[category]`, seletores puros e lista compartilhada para as cinco categorias, busca por username, ordenação A–Z/Z–A e por data, paginação de 50 perfis, indicação de reciprocidade e links HTTPS para o Instagram. Datas ausentes ficam ao final da ordenação por data. Os cartões do dashboard abrem a lista com o identificador do snapshot na URL; a navegação entre categorias e o retorno ao dashboard preservam essa seleção. Snapshot inexistente não é substituído silenciosamente. Estados de carregamento, erro com nova tentativa, vazio, busca sem resultados, dados ausentes e inválidos possuem mensagens distintas.

**Validação:** lint, tipos, build, 48 testes unitários/componentes e 4 E2E passaram. Os novos fluxos E2E importam ZIP sintético, conferem categorias, busca, ordenação, paginação, teclado, recarga do IndexedDB e retorno ao dashboard em viewports de 1280px e 390px, sem exceções JavaScript ou transbordamento horizontal.

### 9. Solicitações pendentes — Concluída

Processar e exibir solicitações enviadas e, quando o arquivo existir, solicitações recebidas. Diferenciar claramente arquivo ausente de lista vazia, mostrar timestamp quando houver e informar que a aplicação não cancela solicitações automaticamente.

**Entregas realizadas:** solicitações enviadas em `/connections/pending-sent` e recebidas em `/connections/pending-received`, acessíveis pelos cards do dashboard e pela navegação das categorias. As listas usam exclusivamente seus respectivos datasets, com busca, ordenação por nome/data, paginação e status próprio. Arquivo ausente, vazio e inválido são distintos. Os textos explicam o caráter opcional das recebidas e que a aplicação não executa ações sobre as solicitações. Linhas das tabelas usam espaçamento vertical de 12px por célula.

**Validação:** lint, tipos, build, 55 testes unitários/componentes e 4 E2E passaram. Os fluxos em desktop e mobile importam arquivos fictícios de enviadas e recebidas, conferem contagens, navegação, busca, ordenação, persistência após recarga e separação entre os conjuntos.

### 10. Histórico e comparação de snapshots — Adiada

**Decisão de 2026-09-15:** a implementação desta etapa foi adiada. A rota `/history` e o acesso no menu foram removidos do código. A persistência da importação atual permanece para alimentar dashboard e listas. Os requisitos abaixo continuam no roadmap para uma retomada futura.

Criar a tela de histórico com abertura, identificação amigável, exclusão individual e exclusão total com confirmação. Comparar snapshots da mesma conta e do mesmo tipo, mostrando adições e remoções sem afirmar causas que os dados não comprovam.

Informar datas, nomes e conjuntos não fornecidos; impedir comparações silenciosas entre contas diferentes identificáveis.

### 11. Configurações, privacidade e dados locais — Concluída

**Escopo simplificado:** manter o seletor de tema, exibir a versão no rodapé, avisos curtos de privacidade/limitações e ação para apagar todos os dados locais. Página de configurações, medidor de armazenamento e exclusão individual foram dispensados pelo usuário.

**Entregas realizadas:** somente a importação atual é mantida; a migração do IndexedDB preserva a mais recente das importações antigas. Substituição exige confirmação explícita, avisa sobre dados equivalentes e é atômica, preservando a importação anterior em caso de erro. Alterações concorrentes exigem nova confirmação. O dashboard não possui mais seletor de snapshots. A ação de limpeza no rodapé exige digitar `APAGAR`, remove o banco local e recarrega a interface. Versão derivada do `package.json`. A interface usa exclusivamente o tema escuro.

**Validação:** lint, tipos, build, 57 testes unitários/componentes e 5 E2E passaram. Cobertura de migração, falha na gravação, substituições simultâneas, cancelamento, dados duplicados, persistência do tema e limpeza completa.

### 12. Testes de ponta a ponta, acessibilidade e revisão responsiva — Pendente

Completar os fluxos E2E com fixture fictícia: importar, confirmar, abrir dashboard, navegar pelas categorias, substituir a importação atual, recarregar e apagar dados. Validar rejeição de ZIP inválido, estados vazios e mensagens de arquivo ausente.

Revisar teclado, foco, contraste, `prefers-reduced-motion`, mobile/desktop, console sem erros e instalação das dependências nativas necessárias para executar o Playwright no ambiente de CI.

## Validação de manutenção — 2026-09-15

- Revisados os textos em português da interface, mensagens de importação e testes, com correções de ortografia, acentuação e crase. Roadmap revisado para manter a mesma escrita.
- Navegação das listas: cards do dashboard mostram "Ver lista", seta e destaque no hover/foco. Listagem compacta em tabela com colunas de número, perfil, relação e data, numeração contínua entre páginas (conforme busca e ordenação) e paginação no topo e rodapé. Em telas estreitas, as categorias têm rolagem horizontal sinalizada, e o cartão de informações do arquivo foi removido.
- Em smartphones, a navegação e as ações do cabeçalho ficam em um menu compacto.
- Ao confirmar o resumo e salvar ou substituir a importação atual, o fluxo abre o dashboard diretamente.
- Identidade visual: app-shell e favicon usam `public/icon-dark.png`, acompanhando o tema escuro exclusivo.
- Dois testes E2E passaram: navegação principal e alternância dos ícones por tema com favicon escuro. O Playwright agora cria um build de produção e inicia um servidor exclusivo na porta 3100, sem reutilizar o servidor de desenvolvimento.
- Lint, checagem de tipos e 37 testes em 9 arquivos passaram.
- Build de produção passou com cache limpo e permissão para abrir a porta interna do Turbopack; a tentativa no sandbox havia falhado por restrição de permissão.
- Configuração do Vitest renomeada para `vitest.config.mts` para explicitar ESM e eliminar o aviso de carregamento como CommonJS.
- Artefatos do Playwright (`test-results/` e `playwright-report/`) ignorados pelo Git.
- Smoke test E2E passou no Chromium. Corrigido o seletor ambíguo de `Importação`, restringindo a busca ao link exato dentro da navegação principal.
- A etapa 12 continua pendente: o smoke test existente não cobre os fluxos completos.

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

1. Completar os testes E2E e revisar acessibilidade e responsividade (etapa 12), respeitando o adiamento do histórico e da comparação.
2. Publicar a primeira release gratuita e recolher feedback voluntário sem solicitar exportações reais ou dados pessoais.
3. Priorizar busca global, explicação das contagens e marcações para revisão conforme o feedback.
4. Validar a utilidade e os formatos de novos datasets do ZIP para possíveis melhorias gratuitas.
5. Retomar histórico e comparação (etapa 10) quando solicitado pelo usuário.

## Backlog pós-release — Registrado em 2026-09-18

Itens planejados, ainda não implementados e sem compromisso de inclusão na primeira release. A ordem abaixo é uma sugestão de prioridade.

- [ ] **Busca global de perfis:** pesquisar um username e mostrar sua presença nos datasets da importação atual; distinguir ausência de registro de dataset não fornecido ou inválido.
- [ ] **Explicação das contagens:** explicar nos cartões os conjuntos usados e o cálculo realizado, incluindo limitações e impossibilidade de cálculo.
- [ ] **Marcações para revisão:** permitir marcar perfis para revisar depois, com persistência local. Antes de implementar, definir preservação na substituição do ZIP, separação por conta e remoção na limpeza de dados; não presumir identidade após mudança de username.
- [ ] **Filtros combinados:** combinar busca, intervalo do timestamp, presença de data e relação unilateral; não atribuir significado não comprovado à data nem reintroduzir conexões mútuas no filtro de categorias.
- [ ] **Diagnóstico da importação:** ampliar o resumo existente com arquivos e partes reconhecidas, duplicatas e entradas ignoradas. Não afirmar que todas as partes estão presentes sem evidência; suporte não deve expor registros pessoais.
- [ ] **Modo demonstração:** explorar dashboard e listas com fixtures fictícias, identificação permanente da demonstração e isolamento dos dados reais já salvos.
- [ ] **Guia interativo da exportação:** orientar seleção de formato JSON e categorias necessárias, com checklist e acesso à importação; revisar os passos contra a interface atual da Meta ao implementar.

## Pesquisa de novos dados do ZIP — Não comprometida

O conteúdo depende das categorias e do período solicitados, do tipo de conta e do formato entregue pela Meta. Os itens abaixo são hipóteses de datasets e produtos a validar, não formatos já suportados. Uma exportação apenas de conexões não deve ser tratada como uma exportação completa.

| Hipótese                                   | Possível funcionalidade                                        | Condição para avançar                                                                                    |
| ------------------------------------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Curtidas e comentários feitos pelo titular | Linha do tempo da própria atividade e distribuição por período | Confirmar estrutura, autoria, datas e cobertura; não confundir interações feitas com recebidas           |
| Conteúdos salvos e coleções                | Biblioteca local com busca e organização                       | Confirmar presença, metadados e vínculos; links podem deixar de funcionar                                |
| Publicações e mídias próprias              | Calendário de publicações e busca por legendas                 | Confirmar formatos; carregar mídias sob demanda dentro dos limites de processamento                      |
| Bloqueados, restritos e amigos próximos    | Revisão das listas de privacidade                              | Confirmar quais listas realmente são fornecidas; nenhuma alteração automática no Instagram               |
| Mensagens                                  | Busca local no arquivo de conversas e estatísticas descritivas | Módulo opcional com adesão explícita, minimização de armazenamento e exclusão completa; prioridade baixa |

- [ ] Inventariar os formatos usando somente estruturas anonimizadas e fixtures sintéticas; não versionar ZIPs reais.
- [ ] Permitir escolher os módulos a processar e indicar o que está disponível antes de persistir novos datasets.
- [ ] Preservar os estados disponível, vazio, não fornecido e inválido por dataset, informando período e cobertura quando conhecidos.
- [ ] Avaliar processamento em Web Worker e importação seletiva para arquivos maiores, mantendo limites de segurança e cancelamento.
- [ ] Não inferir visitantes do perfil, bloqueios sofridos, seguidores falsos, exclusões de conta ou falta de interesse a partir de dados ausentes.

## Separação de projetos — Decisão de 2026-09-18

O Unveil permanece um projeto de portfólio gratuito para facilitar a consulta das informações do ZIP. As hipóteses anteriores de planos pagos e integração com a API oficial foram retiradas deste roadmap.

A descoberta de um pequeno SaaS para produtores de conteúdo e influenciadores, usando a API oficial do Instagram, pertence a outro projeto. Público prioritário, problema, viabilidade técnica, funcionalidades e modelo de receita serão definidos separadamente; não são requisitos de implementação do Unveil.

O planejamento independente está em [Unveil X — Roadmap de produto](UNVEIL-X-ROADMAP.md), com nome provisório e fases de validação, MVP e monetização.
