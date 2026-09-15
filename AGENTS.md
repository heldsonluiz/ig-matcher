# Unveil

## 1. Objetivo deste arquivo

Este arquivo orienta o Codex na criação e manutenção de uma aplicação pessoal para analisar conexões de uma conta do Instagram a partir do arquivo ZIP oficial exportado pela Meta.

Antes de implementar ou alterar qualquer funcionalidade, leia este documento inteiro. Trate os requisitos descritos aqui como a fonte principal de verdade do projeto.

Se uma solicitação futura entrar em conflito com este documento, siga a solicitação mais recente do usuário e atualize este arquivo para registrar a nova decisão.

## 2. Visão geral do produto

O nome da aplicação é Unveil e o repositório é `heldsonluiz/unveil`. As chaves internas de IndexedDB e preferência de tema mantêm os identificadores legados para preservar os dados das instalações existentes; não são nomes de apresentação.

### Decisão de escopo — 2026-09-15

Histórico e comparação entre snapshots (etapa 10, RF-11 na parte de interface de histórico e RF-12) foram adiados por solicitação do usuário. A rota e os acessos de histórico devem permanecer fora da aplicação por enquanto. Os requisitos ficam documentados no roadmap para retomada futura. A persistência local mantém apenas a importação atual para dashboard e listas. A exportação de resultados em CSV/JSON foi retirada do escopo por solicitação do usuário; não deve ser implementada nem mantida no roadmap. A etapa 11 foi simplificada: seletor de tema existente, versão no rodapé, aviso curto de privacidade/limitações e exclusão de todos os dados com confirmação reforçada. Não criar página de configurações, medidor de armazenamento nem exclusão individual. Ao importar um novo ZIP, pedir confirmação explícita para substituir a importação atual. Ao migrar instalações antigas, manter apenas o snapshot de importação mais recente.

A aplicação deve permitir que o usuário importe o ZIP oficial de dados do Instagram e visualize:

- todas as pessoas que seguem o usuário;
- todas as pessoas que o usuário segue;
- pessoas que o usuário segue, mas que não o seguem de volta;
- pessoas que seguem o usuário, mas que ele não segue de volta;
- conexões mútuas;
- solicitações para seguir enviadas pelo usuário que continuam pendentes;
- solicitações para seguir recebidas pelo usuário, quando esse dado existir;
- diferenças entre importações realizadas em datas diferentes.

A aplicação é de uso pessoal, local-first e não deve solicitar a senha do Instagram. Não deve acessar APIs privadas, automatizar o navegador, fazer scraping ou executar ações como seguir, deixar de seguir ou cancelar solicitações.

## 3. Stack obrigatória

- Next.js com App Router
- React
- TypeScript em modo estrito
- Tailwind CSS
- shadcn/ui
- Zod para validação dos dados importados
- JSZip para leitura do arquivo ZIP no navegador
- IndexedDB para persistência local, preferencialmente por meio da biblioteca `idb`
- Vitest e React Testing Library para testes unitários e de componentes
- Playwright para os fluxos essenciais de ponta a ponta
- ESLint e Prettier

Não adicionar backend, banco de dados remoto, autenticação ou serviço externo sem uma solicitação explícita do usuário.

## 4. Princípios técnicos

### 4.1 Privacidade

- Processar o ZIP exclusivamente no navegador.
- Não enviar o ZIP ou seu conteúdo pela rede.
- Não armazenar senha, cookie ou token do Instagram.
- Não incluir trackers, analytics ou telemetria por padrão.
- Informar claramente na interface que os dados permanecem no dispositivo.
- Oferecer uma ação para apagar todos os dados locais.

### 4.2 Confiabilidade

- Nunca afirmar que uma lista está vazia quando o arquivo correspondente não foi fornecido pelo Instagram.
- Diferenciar os estados `disponível`, `vazio`, `não fornecido` e `inválido`.
- Não depender apenas de um caminho ou nome exato de arquivo.
- Validar estruturas externas com Zod antes de convertê-las para o modelo interno.
- Ignorar arquivos desconhecidos sem interromper toda a importação.
- Exibir avisos compreensíveis quando apenas parte dos dados puder ser processada.

### 4.3 Manutenção

- Separar leitura do ZIP, descoberta de arquivos, parsing, normalização, comparação e interface.
- Manter a lógica de domínio em funções puras sempre que possível.
- Evitar componentes grandes com regras de negócio embutidas.
- Criar testes para cada formato de exportação suportado.
- Não acoplar o parser ao idioma escolhido na exportação.

## 5. Estrutura sugerida

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── import/page.tsx
│   ├── dashboard/page.tsx
│   ├── connections/[category]/page.tsx
├── components/
│   ├── app-shell/
│   ├── dashboard/
│   ├── import/
│   ├── connections/
│   ├── history/
│   └── ui/
├── features/
│   ├── instagram-import/
│   │   ├── discover-files.ts
│   │   ├── parse-export.ts
│   │   ├── normalize-entry.ts
│   │   ├── schemas.ts
│   │   └── types.ts
│   ├── connections/
│   │   ├── calculate-relationships.ts
│   │   ├── selectors.ts
│   │   └── types.ts
│   └── snapshots/
│       ├── compare-snapshots.ts
│       ├── repository.ts
│       └── types.ts
├── lib/
│   ├── db.ts
│   ├── format-date.ts
│   └── utils.ts
└── test/
    ├── fixtures/
    └── setup.ts
```

A estrutura pode ser ajustada se houver uma justificativa técnica clara, mas as responsabilidades devem continuar separadas.

## 6. Modelo de domínio

Use um modelo interno normalizado, independente do formato específico da Meta.

```ts
export type InstagramProfile = {
  username: string;
  profileUrl: string;
  timestamp: number | null;
};

export type DatasetStatus =
  | "available"
  | "empty"
  | "not_provided"
  | "invalid";

export type ImportedDataset = {
  status: DatasetStatus;
  sourceFiles: string[];
  profiles: InstagramProfile[];
  warnings: string[];
};

export type InstagramSnapshot = {
  id: string;
  importedAt: string;
  exportGeneratedAt: string | null;
  sourceFileName: string;
  accountUsername: string | null;
  followers: ImportedDataset;
  following: ImportedDataset;
  pendingSentRequests: ImportedDataset;
  pendingReceivedRequests: ImportedDataset;
};
```

O `username` deve ser armazenado em formato normalizado para comparação, removendo `@`, espaços nas extremidades e diferenças entre letras maiúsculas e minúsculas. Preserve, quando possível, a forma original apenas para apresentação.

## 7. Arquivos da exportação

O importador deve reconhecer, no mínimo, os seguintes padrões:

| Conjunto | Padrões esperados |
| --- | --- |
| Seguidores | `followers.json`, `followers_1.json`, `followers_2.json` e demais partes numeradas |
| Seguindo | `following.json`, `following_1.json` e possíveis partes numeradas |
| Solicitações enviadas pendentes | `pending_follow_requests.json` |
| Solicitações recebidas | `follow_requests_you've_received.json` e variações equivalentes |

Os arquivos geralmente aparecem em pastas como `connections/followers_and_following/`, mas a busca deve percorrer o ZIP e comparar o nome-base do arquivo, sem depender do caminho completo.

O parser deve suportar as estruturas JSON conhecidas da Meta, incluindo entradas aninhadas em `string_list_data`, por exemplo:

```json
{
  "title": "",
  "media_list_data": [],
  "string_list_data": [
    {
      "href": "https://www.instagram.com/exemplo",
      "value": "exemplo",
      "timestamp": 1700000000
    }
  ]
}
```

Também deve tolerar objetos contêineres como `relationships_following` e listas presentes diretamente na raiz. O parser não deve assumir que todos os arquivos têm exatamente o mesmo envelope.

## 8. Requisitos funcionais

### RF-01: Tela inicial

A tela inicial deve:

- explicar em poucas frases o propósito da aplicação;
- deixar claro que ela não pede login ou senha do Instagram;
- informar que o processamento acontece localmente;
- apresentar um botão para iniciar a importação;
- mostrar um atalho para o último snapshot, quando houver dados salvos;
- oferecer instruções resumidas para obter o ZIP oficial.

#### Critérios de aceite

- Um usuário novo consegue identificar a ação principal sem navegar por menus.
- Nenhuma afirmação sugere atualização automática ou em tempo real.
- A tela funciona sem JavaScript apenas no nível básico de apresentação, mas a importação pode exigir JavaScript.

### RF-02: Importação do ZIP

A tela de importação deve:

- aceitar somente arquivos `.zip` por seletor e arrastar e soltar;
- exibir nome e tamanho do arquivo selecionado;
- rejeitar arquivos incompatíveis com uma mensagem clara;
- impor um limite de tamanho configurável e informar esse limite antes do envio;
- abrir o ZIP no navegador usando JSZip;
- localizar todos os arquivos relevantes;
- ler todas as partes numeradas de seguidores e seguindo;
- validar e normalizar os registros;
- remover duplicatas pelo `username` normalizado;
- exibir o progresso por etapas;
- permitir cancelar antes de salvar o snapshot;
- apresentar um resumo da importação antes da confirmação.

#### Resumo obrigatório

- quantidade de seguidores;
- quantidade de perfis seguidos;
- quantidade de solicitações enviadas pendentes;
- quantidade de solicitações recebidas;
- arquivos encontrados;
- conjuntos não fornecidos;
- arquivos inválidos ou parcialmente ignorados;
- total de entradas duplicadas removidas.

#### Critérios de aceite

- Um ZIP válido não é enviado ao servidor.
- Um erro em um arquivo opcional não impede o processamento dos demais.
- O usuário precisa confirmar antes de persistir a importação.
- Importar novamente o mesmo arquivo não cria uma duplicação silenciosa. A aplicação deve avisar e permitir substituir ou cancelar.

### RF-03: Dashboard

O dashboard deve mostrar cartões com:

- seguidores;
- seguindo;
- conexões mútuas;
- não seguem de volta;
- não sigo de volta;
- solicitações enviadas pendentes;
- solicitações recebidas, quando disponíveis.

Também deve mostrar:

- data e hora da importação atual;
- nome do arquivo de origem;
- identificação da importação atual, sem seletor de snapshots;
- avisos sobre conjuntos não fornecidos ou inválidos;
- botão para importar um arquivo mais recente.

Cada cartão deve abrir sua lista correspondente.

#### Critérios de aceite

- Contagens derivadas só aparecem quando os conjuntos necessários estão disponíveis.
- Quando um cálculo não for possível, mostrar `Dados não fornecidos` em vez de zero.
- O dashboard não mistura dados de snapshots diferentes.

### RF-04: Lista de seguidores

Deve listar todos os perfis presentes no conjunto de seguidores e oferecer:

- busca por nome de usuário;
- ordenação alfabética;
- ordenação por data, quando houver timestamp;
- indicação de seguimento mútuo;
- link para abrir o perfil em uma nova aba;
- paginação ou virtualização para listas grandes.

### RF-05: Lista de perfis seguidos

Deve possuir os mesmos recursos da lista de seguidores e indicar:

- se o perfil segue o usuário de volta;
- se a relação é unilateral;
- a data disponível no arquivo de exportação, sem atribuir a ela um significado que não esteja confirmado.

### RF-06: Pessoas que não seguem de volta

Calcular por diferença de conjuntos:

```ts
notFollowingBack = following - followers;
```

A comparação deve usar o `username` normalizado.

#### Critérios de aceite

- A lista só é calculada quando seguidores e seguindo estiverem disponíveis.
- Contas duplicadas não alteram o resultado.
- O texto da interface deixa claro que o resultado reflete o momento da exportação.
- O filtro de categorias das listagens não deve incluir conexões mútuas. O aviso de perfis indisponíveis deve aparecer entre as informações do arquivo e o filtro de categorias.
- As listas de seguindo e de quem não segue de volta devem explicar que um perfil registrado no ZIP pode estar indisponível hoje. Não afirmar que toda conta excluída permanece em novas exportações nem inferir exclusão, suspensão ou desativação pela ausência em seguidores ou por um link indisponível.

### RF-07: Pessoas que o usuário não segue de volta

Calcular por diferença de conjuntos:

```ts
notFollowedBackByMe = followers - following;
```

Aplicam-se os mesmos recursos de busca, ordenação e paginação das demais listas.

### RF-08: Conexões mútuas

Calcular pela interseção:

```ts
mutuals = followers ∩ following;
```

A tela deve apresentar somente perfis encontrados nos dois conjuntos do mesmo snapshot.

### RF-09: Solicitações enviadas pendentes

A aplicação deve procurar e processar `pending_follow_requests.json` e variações reconhecidas.

A tela deve:

- listar o nome de usuário;
- oferecer link para o perfil;
- exibir o timestamp fornecido pela Meta, quando houver;
- permitir ordenar das solicitações mais antigas para as mais recentes e vice-versa;
- deixar claro que a aplicação não cancela solicitações automaticamente.

#### Critérios de aceite

- Arquivo presente e lista vazia resulta em `Nenhuma solicitação pendente encontrada`.
- Arquivo ausente resulta em `O Instagram não forneceu esses dados nesta exportação`.
- A ausência do arquivo nunca deve ser convertida em uma lista vazia.

### RF-10: Solicitações recebidas

Quando o conjunto correspondente estiver presente, listar as solicitações recebidas ainda registradas na exportação. Essa funcionalidade deve ser tratada como opcional, pois contas públicas ou determinadas exportações podem não fornecer o arquivo.

Não misturar solicitações recebidas com solicitações enviadas.

### RF-11: Importação atual

A aplicação deve manter somente uma importação no IndexedDB. Ao migrar dados antigos, conservar a mais recente pela data da importação. A substituição deve ser atômica e exigir confirmação explícita, inclusive para dados equivalentes. Se os dados atuais mudarem em outra aba, exigir nova revisão antes de substituir. Falhas e cancelamentos devem preservar a importação anterior.

Para cada snapshot, armazenar:

- identificador local;
- data da importação;
- data de geração identificada, quando disponível;
- nome do ZIP;
- perfil associado, quando identificável;
- datasets normalizados;
- avisos gerados durante a importação;
- hash do arquivo ou assinatura determinística dos conjuntos, para detectar duplicatas.

### RF-12: Comparação entre snapshots — Adiada

Dados dois snapshots da mesma conta, a aplicação deve identificar:

- perfis adicionados à lista de seguidores;
- perfis removidos da lista de seguidores;
- perfis adicionados à lista de seguindo;
- perfis removidos da lista de seguindo;
- solicitações pendentes adicionadas;
- solicitações que deixaram de aparecer como pendentes.

#### Regras de interpretação

- Um perfil removido da lista de seguidores é uma mudança observada, não uma prova absoluta de que a pessoa deixou de seguir o usuário.
- Mudanças de nome, desativação, exclusão ou indisponibilidade de conta podem produzir diferenças.
- Uma solicitação que deixou de aparecer como pendente pode ter sido aceita, recusada, cancelada ou afetada por indisponibilidade da conta.
- A interface deve usar linguagem como `não aparece no snapshot mais recente`, evitando conclusões que os dados não comprovam.

#### Critérios de aceite

- Não permitir comparação silenciosa entre contas diferentes quando ambas forem identificáveis.
- Mostrar as datas e os nomes dos dois snapshots comparados.
- Comparar sempre conjuntos do mesmo tipo.
- Informar quando um dos conjuntos necessários não tiver sido fornecido.

### RF-14: Configurações e dados locais

Sem uma página exclusiva de configurações, a interface deve permitir:

- escolher tema claro, escuro ou do sistema pelo seletor existente; usar escuro como padrão quando não houver preferência válida salva, preservando escolhas anteriores;
- apagar a importação atual e a preferência de tema usando uma ação no rodapé, com confirmação reforçada digitando `APAGAR`;
- consultar avisos curtos de privacidade e limitações na importação e no dashboard;
- consultar a versão da aplicação no rodapé, derivada do `package.json`.
- acessar no rodapé uma ação discreta de apoio, com a chave Pix aleatória visível e copiável;
- acessar uma ajuda com link para criar uma issue no GitHub e avisos de que as contagens podem divergir por perfis indisponíveis e que os dados não se atualizam automaticamente.

Não incluir medição de armazenamento, exclusão individual ou histórico. A limpeza deve remover apenas os dados desta aplicação e não alterar o ZIP original nem chaves de outros aplicativos.

## 9. Regras de cálculo

Todos os cálculos devem usar conjuntos de usernames normalizados:

```ts
const normalizeUsername = (value: string) =>
  value.trim().replace(/^@/, "").toLocaleLowerCase("en-US");
```

Operações principais:

```ts
const mutuals = intersection(followers, following);
const notFollowingBack = difference(following, followers);
const notFollowedBackByMe = difference(followers, following);
```

Não usar o timestamp como identificador. Não inferir identidade por nome de exibição. O nome de usuário é o identificador disponível, reconhecendo que ele pode mudar entre snapshots.

## 10. Estados da interface

Todas as telas assíncronas devem tratar:

- estado inicial;
- carregamento;
- sucesso com dados;
- sucesso sem registros;
- conjunto não fornecido;
- erro recuperável;
- erro que impede a importação.

Mensagens de erro devem explicar o que aconteceu e indicar uma ação possível. Não mostrar stack traces ou mensagens internas ao usuário final.

## 11. Acessibilidade e responsividade

- A interface deve funcionar em dispositivos móveis e desktop.
- Todas as ações devem ser acessíveis por teclado.
- A área de arrastar e soltar também deve possuir um botão de seleção de arquivo.
- Usar elementos semânticos e rótulos associados aos controles.
- Manter contraste compatível com WCAG AA.
- Não depender somente de cor para comunicar estados.
- Respeitar `prefers-reduced-motion`.
- Manter foco visível e gerenciar o foco em diálogos.

## 12. Segurança

- Não renderizar HTML proveniente do ZIP.
- Tratar todos os nomes, URLs e conteúdos importados como dados não confiáveis.
- Aceitar links externos apenas com protocolos permitidos, preferencialmente `https:`.
- Usar `noopener noreferrer` em links externos.
- Limitar tamanho do ZIP, número de arquivos, tamanho descompactado e profundidade processada para reduzir risco de ZIP bomb.
- Nunca executar arquivos presentes no ZIP.
- Não registrar conteúdo importado no console em produção.
- Evitar dependências que façam upload automático ou telemetria.

## 13. Testes obrigatórios

### Testes unitários

- normalização de usernames;
- remoção de duplicatas;
- união de arquivos `followers_N.json`;
- descoberta de arquivos em caminhos diferentes;
- parsing de cada envelope JSON suportado;
- tratamento de JSON inválido;
- diferença e interseção de conjuntos;
- substituição atômica da importação atual e migração de dados antigos;
- distinção entre dataset vazio e não fornecido;

### Testes de componentes

- seleção e remoção de um ZIP;
- estados do resumo de importação;
- busca e ordenação das listas;
- cartões indisponíveis no dashboard;
- confirmação para exclusão de dados;
- mensagens específicas para arquivo ausente e lista vazia.

### Testes de ponta a ponta

- importar fixture válida, confirmar e abrir o dashboard;
- navegar pelas categorias e conferir as contagens;
- importar, cancelar e confirmar uma substituição, garantindo que apenas a importação atual permaneça;
- recarregar a aplicação e recuperar dados do IndexedDB;
- apagar todos os dados locais;
- rejeitar ZIP inválido sem quebrar a aplicação.

Fixtures devem usar usuários fictícios. Nunca versionar uma exportação real do Instagram.

## 14. Definition of Done

Uma funcionalidade só está concluída quando:

- atende aos requisitos e critérios de aceite correspondentes;
- possui tratamento de carregamento, vazio, indisponibilidade e erro;
- não envia informações pessoais pela rede;
- funciona em viewport móvel e desktop;
- possui acessibilidade básica validada;
- inclui testes relevantes;
- passa em lint, checagem de tipos e testes;
- não introduz erros no console;
- atualiza este arquivo ou a documentação quando houver nova decisão funcional.

## 15. Passo a passo para criar a base pelo terminal

Os comandos abaixo usam npm. Execute-os no diretório que deverá conter o projeto.

### 15.1 Criar o projeto Next.js

```bash
npx create-next-app@latest unveil \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-npm
```

Entre na pasta:

```bash
cd unveil
```

Se este arquivo ainda estiver fora do projeto, copie `AGENTS.md` para a raiz, no mesmo nível de `package.json`.

### 15.2 Instalar as dependências de domínio

```bash
npm install jszip zod idb
```

### 15.3 Inicializar o shadcn/ui

```bash
npx shadcn@latest init
```

Ao responder às perguntas do assistente, mantenha os caminhos compatíveis com `src/` e o alias `@/*`.

Adicione os componentes iniciais:

```bash
npx shadcn@latest add \
  alert \
  badge \
  button \
  card \
  dialog \
  dropdown-menu \
  input \
  progress \
  select \
  separator \
  skeleton \
  table \
  tabs \
  toast \
  tooltip
```

Se algum componente tiver sido renomeado ou descontinuado, use o equivalente atual oferecido pelo CLI e registre a decisão neste arquivo.

### 15.4 Instalar ferramentas de teste e formatação

Este projeto mantém compatibilidade com Node.js 20 e `@types/node@20`. Por isso, use Vitest 4 e mantenha o pacote de cobertura na mesma versão principal. Não instale `@vitejs/plugin-react`: o Next.js não usa Vite para executar a aplicação e o Vitest já processa TypeScript e JSX sem esse plugin.

```bash
npm install --save-dev \
  vitest@4 \
  @vitest/coverage-v8@4 \
  jsdom \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @playwright/test \
  prettier \
  prettier-plugin-tailwindcss
```

Não use `--force` ou `--legacy-peer-deps` para contornar conflitos de dependências. Se uma tentativa anterior tiver registrado o Vitest 5 no `package.json`, remova essa entrada antes de instalar:

```bash
npm pkg delete devDependencies.vitest
npm pkg delete devDependencies.@vitest/coverage-v8
```

Depois, execute novamente o comando de instalação acima.

Crie `vitest.config.mts` na raiz do projeto. A extensão `.mts` explicita o formato ESM e evita o aviso do Vite sobre carregar a configuração como CommonJS:

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: true,
  },
});
```

Crie `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Adicione `vitest/globals` à propriedade `types` dentro de `compilerOptions` no `tsconfig.json`. Preserve todas as outras opções existentes:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

Confira a árvore instalada:

```bash
npm ls vitest vite @types/node
```

A combinação esperada é Node.js 20, `@types/node@20` e `vitest@4`. O Vite será instalado como dependência do Vitest e não precisa ser adicionado diretamente.

Instale o navegador usado pelo Playwright:

```bash
npx playwright install chromium
```

### 15.5 Criar a estrutura inicial

Em sistemas Linux, macOS ou WSL:

```bash
mkdir -p \
  src/components/app-shell \
  src/components/dashboard \
  src/components/import \
  src/components/connections \
  src/components/history \
  src/features/instagram-import \
  src/features/connections \
  src/features/snapshots \
  src/lib \
  src/test/fixtures \
  tests/e2e
```

Não crie arquivos vazios apenas para preservar diretórios. Crie cada arquivo quando sua responsabilidade for implementada.

### 15.6 Adicionar scripts ao `package.json`

Configure os scripts abaixo, preservando os scripts já criados pelo Next.js:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "validate": "npm run lint && npm run typecheck && npm run test:run && npm run build"
  }
}
```

Se a versão instalada do Next.js gerar scripts diferentes, mantenha os comandos oficiais e adicione apenas os scripts ausentes.

### 15.7 Iniciar o Git

Caso o gerador não tenha inicializado o repositório:

```bash
git init
git add .
git commit -m "chore: create application base"
```

### 15.8 Executar a aplicação

```bash
npm run dev
```

Acesse `http://localhost:3000`.

### 15.9 Validar a base

Depois de configurar testes, lint e formatação:

```bash
npm run validate
npm run test:e2e
```

## 16. Ordem recomendada de implementação

Implemente em incrementos pequenos e verificáveis:

1. Configuração do projeto, tema e shell da aplicação.
2. Tipos de domínio, schemas Zod e fixtures fictícias.
3. Leitura segura do ZIP e descoberta dos arquivos.
4. Parsers, normalização, deduplicação e testes unitários.
5. Resumo e confirmação da importação.
6. Persistência de snapshots no IndexedDB.
7. Cálculos das categorias e dashboard.
8. Listas com busca, ordenação, paginação e links.
9. Solicitações enviadas e recebidas.
10. Comparação entre snapshots (adiada).
11. Configurações, exclusão de dados e textos de privacidade.
12. Testes de ponta a ponta, acessibilidade e revisão responsiva.

Ao concluir cada etapa, execute pelo menos:

```bash
npm run lint
npm run typecheck
npm run test:run
```

## 17. Instruções para o Codex

Ao receber uma tarefa neste repositório:

1. Leia este `AGENTS.md` antes de editar arquivos.
2. Inspecione a estrutura e as alterações existentes antes de propor mudanças.
3. Preserve alterações do usuário que não façam parte da tarefa.
4. Implemente o menor incremento completo que atenda à solicitação.
5. Use fixtures sintéticas nos testes.
6. Não use dados reais do Instagram em exemplos, logs ou commits.
7. Execute testes, lint e checagem de tipos relacionados à mudança.
8. Informe o que foi alterado, como foi validado e quais limitações permanecem.
9. Não implemente scraping ou automação de ações no Instagram, mesmo como alternativa silenciosa.
10. Se o formato de uma exportação real não for reconhecido, solicite apenas uma amostra anonimizada da estrutura necessária, sem usernames ou outros dados pessoais.

## 18. Fora do escopo inicial

- Login com Instagram.
- Sincronização em tempo real.
- Uso da Instagram Graph API.
- Scraping de páginas ou endpoints privados.
- Armazenamento em nuvem.
- Sincronização entre dispositivos.
- Seguir ou deixar de seguir perfis.
- Cancelar solicitações automaticamente.
- Enviar mensagens.
- Descobrir com certeza o motivo de um perfil desaparecer entre snapshots.
- Aplicação pública com múltiplos usuários.

Essas funcionalidades só devem ser consideradas após solicitação explícita e nova avaliação de privacidade, segurança e regras da plataforma.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
