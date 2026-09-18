# Unveil X — Roadmap de produto

Criado em 2026-09-18. Status: descoberta. Nome provisório; nenhuma etapa de implementação concluída.

Este documento planeja um SaaS independente para pequenos produtores de conteúdo e influenciadores. Está temporariamente neste repositório como documento de planejamento. O Unveil continua sendo um projeto de portfólio gratuito, local e baseado em ZIP; seu escopo e seu roadmap não são alterados por este plano. A implementação do SaaS deverá começar em repositório próprio, com instruções, infraestrutura e dados separados.

## 1. Direção e hipóteses

**Direção definida:** explorar um SaaS acessível usando a API oficial do Instagram para pequenos criadores.

**Proposta a validar:** ajudar o criador a decidir o próximo conteúdo a partir dos resultados das próprias publicações e, posteriormente, apresentar resultados de parcerias.

**Público inicial proposto:** criadores brasileiros que administram o próprio perfil profissional, publicam semanalmente e buscam profissionalizar a produção. Priorizar comportamento e problema real, sem fixar uma faixa de seguidores antes das entrevistas.

**Rotina central:** conectar a conta → organizar publicações → revisar resultados → escolher um experimento → acompanhar o resultado.

Nome, nicho inicial, conjunto de métricas, preço, fornecedores e arquitetura final permanecem em aberto. O plano não pressupõe demanda comprovada, aprovação da Meta ou disponibilidade de todas as métricas.

## 2. Ideias de nome

Sugestões criativas; disponibilidade de domínio, marcas e identificadores sociais não pesquisada.

| Nome          | Intenção                                                  | Ponto de atenção                                                     |
| ------------- | --------------------------------------------------------- | -------------------------------------------------------------------- |
| Unveil X      | Preservar a ligação com o projeto original                | O X não explica o benefício e pode sugerir uma versão paga do Unveil |
| Unveil Studio | Associar a marca ao trabalho do criador                   | Precisa comunicar que é um produto independente                      |
| Cadência      | Destacar consistência, aprendizado e rotina de publicação | Nome amplo; avaliar escrita sem acento nos endereços                 |
| Próxima Pauta | Tornar explícita a decisão sobre o próximo conteúdo       | Pode parecer uma ferramenta apenas de ideias                         |
| Pauta Clara   | Associar clareza à produção de conteúdo                   | Precisa comunicar a análise de resultados                            |
| Pulso Criador | Expressar acompanhamento contínuo do perfil               | Nome mais longo                                                      |
| Rastro Studio | Associar resultados ao aprendizado deixado pelo conteúdo  | Exige testar a interpretação do nome                                 |

Preferências iniciais: **Cadência** para marca independente; **Unveil Studio** para manter parentesco visual. Usar **Unveil X** como nome de trabalho até decidir.

- [ ] Testar compreensão e pronúncia com criadores do público escolhido.
- [ ] Pesquisar conflitos de marca, domínio e identificadores antes de investir em identidade visual.
- [ ] Definir nome e frase de apresentação após validar o problema principal.

## 3. Fase 0 — Descoberta do problema

- [ ] Entrevistar 8–10 criadores; começar com quem seja acessível ao fundador, sem enviar contatos automaticamente.
- [ ] Identificar um grupo inicial com contexto semelhante: por exemplo, educação, beleza ou gastronomia.
- [ ] Pedir exemplos da última análise de conteúdo, da decisão seguinte e da última prestação de contas de uma parceria.
- [ ] Registrar frequência do problema, solução atual, tempo gasto e ferramentas pelas quais já pagam.
- [ ] Comparar duas hipóteses: revisão semanal de conteúdo e organização de resultados de publis.
- [ ] Selecionar 3–5 participantes para testar um protótipo com dados fictícios ou fornecidos com autorização.

**Critério proposto de avanço:** pelo menos cinco entrevistados descrevem um problema recorrente semelhante e três aceitam testar a solução. A amostra é exploratória; interesse verbal não comprova disposição a pagar.

**Entrega:** público prioritário, problema principal, evidências anonimizadas e fluxo escolhido. Se a dor principal for prestação de contas de publis, revisar o MVP antes de implementar.

## 4. Fase 1 — Viabilidade da API

Pode ocorrer junto da descoberta, antes de prometer funcionalidades. A pesquisa anterior identificou a API oficial como caminho para contas profissionais; endpoints, permissões e restrições precisam ser reconfirmados na documentação vigente e em conta de teste autorizada.

- [ ] Escolher a modalidade de integração e validar elegibilidade de contas Creator e Business.
- [ ] Provar conexão, leitura de publicações, paginação e obtenção das métricas necessárias ao problema escolhido.
- [ ] Criar uma matriz por métrica: endpoint, permissão, tipo de conteúdo, unidade, período, histórico disponível, restrições e comportamento em contas pequenas.
- [ ] Testar métricas ausentes, zeros, conteúdo removido, falhas parciais, expiração e revogação de acesso.
- [ ] Confirmar requisitos de revisão do aplicativo e acesso para usuários externos; sucesso com conta de teste não equivale a liberação pública.
- [ ] Estimar volume de chamadas e estratégia de coleta respeitando limites, sem prometer atualização em tempo real.
- [ ] Documentar o que pode ser recuperado retroativamente e o que só poderá ser observado após a conexão.

**Critério de avanço:** produzir uma revisão útil com dados realmente disponíveis, provar reconexão e documentar o caminho para atender usuários externos. Se uma métrica essencial não existir, reformular a proposta antes de ampliar a implementação.

Referência inicial: [documentação oficial da Meta no Postman](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api). Esta referência não é uma garantia de disponibilidade futura de campos ou permissões.

## 5. Fase 2 — Protótipo da experiência

- [ ] Prototipar conexão, biblioteca, revisão semanal e registro de experimento em telas móveis e desktop.
- [ ] Testar com 3–5 criadores se conseguem identificar uma ação útil e explicar quais dados a sustentam.
- [ ] Mostrar estados de primeira sincronização, pouco histórico, amostra pequena e necessidade de reconectar.
- [ ] Ajustar a linguagem para quem não trabalha com análise de dados.

**Critério de avanço:** pelo menos três participantes concluem o fluxo central e identificam uma decisão concreta sem explicação do facilitador. Registrar objeções e diferenças em relação à solução que usam hoje.

## 6. Fase 3 — MVP privado

### Funcionalidades essenciais

- [ ] **Conta no SaaS e conexão oficial:** autenticação do produto separada da autorização da Meta, uma conta de Instagram por usuário no piloto e opção de desconectar.
- [ ] **Biblioteca de publicações:** conteúdo obtido pela API, busca e filtros por período/formato, etiquetas manuais de tema e objetivo, link para a publicação e data da última coleta.
- [ ] **Comparação contextualizada:** agrupar por formato e etiquetas, mostrar número de publicações, período, métricas disponíveis e idade dos conteúdos.
- [ ] **Revisão semanal dentro do produto:** observações baseadas em regras claras, indicação da evidência e uma hipótese de próximo experimento.
- [ ] **Experimentos:** registrar hipótese, conteúdos relacionados, métrica de interesse e prazo; depois registrar resultado e aprendizado.
- [ ] **Controle dos dados:** desconexão, exclusão da conta e tratamento explícito de falhas na coleta.

### Regras de análise

- Não comparar silenciosamente conteúdos de idades diferentes. Comparações em uma janela fixa, como sete dias após publicação, dependem de observações coletadas nessa janela; não reconstruir valores históricos inexistentes.
- Não misturar métricas com definições diferentes ou confundir totais acumulados com valores de um período.
- Explicar fórmulas e denominadores. Métrica ausente e denominador zero não devem gerar uma taxa inventada.
- Mostrar a amostra e evitar conclusões quando insuficiente; definir e testar critérios antes do piloto.
- Usar linguagem de hipótese, sem prometer crescimento ou atribuir causalidade a correlações.
- Começar com cálculos determinísticos e textos estruturados. IA generativa é opcional e deve demonstrar ganho de utilidade e custo viável antes de entrar no produto.

### Base técnica proposta

Definir fornecedores em uma decisão de arquitetura no novo repositório. Proposta inicial: aplicação web em TypeScript, backend simples, banco relacional e tarefas de sincronização em segundo plano.

- [ ] Isolamento entre usuários aplicado e testado no servidor e nas tarefas de coleta.
- [ ] Tokens protegidos no servidor, segredos fora do código e validação do fluxo OAuth.
- [ ] Coleta idempotente com paginação, controle de concorrência, novas tentativas e limites de uso.
- [ ] Armazenar origem, versão/definição da métrica, período e momento da coleta para preservar o significado dos números.
- [ ] Monitorar falhas e custo por conta sem registrar tokens ou conteúdo desnecessário.
- [ ] Definir retenção, exclusão e recuperação de dados, inclusive comportamento dos backups e tarefas após desconexão.
- [ ] Preparar os materiais e fluxos exigidos para a integração pública e informar claramente quais dados são processados no servidor.

**Critério de avanço:** fluxo completo estável com contas autorizadas; testes de isolamento, cálculos, sincronização e reconexão; uso móvel acessível e ausência de falhas críticas conhecidas. Lançamento externo depende também dos requisitos da plataforma.

## 7. Fase 4 — Piloto e monetização

- [ ] Convidar um grupo pequeno após confirmar a possibilidade de acesso externo; meta inicial proposta: 5–10 criadores durante quatro semanas.
- [ ] Acompanhar ativação: primeira sincronização utilizável e primeira revisão que leve a uma ação registrada.
- [ ] Medir retorno semanal, experimentos registrados, decisões relatadas e motivos de abandono.
- [ ] Testar uma oferta simples para uma conta conectada, sem criar vários planos antecipadamente.
- [ ] Explorar R$ 19–39/mês como hipótese de preço, não como preço definido ou benchmark validado.
- [ ] Calcular receita líquida, custos de infraestrutura, cobrança, eventual IA e tempo de suporte por cliente.
- [ ] Implementar cobrança apenas quando necessária ao piloto pago, com estados de assinatura, cancelamento e processamento idempotente de notificações do provedor.

**Critérios propostos para continuar:** ao menos metade do grupo usa a revisão em três das quatro semanas, três participantes aceitam pagar e há uma contribuição positiva por cliente após os custos variáveis. Registrar pagamentos efetivos separadamente de intenção; revisar os números conforme o tamanho real da amostra.

Se houver interesse inicial sem retorno, investigar o valor semanal antes de adicionar funcionalidades. Se o uso se concentrar em campanhas ocasionais, avaliar cobrança por campanha ou outro modelo antes de insistir em assinatura.

## 8. Fase 5 — Expansões condicionadas à demanda

Priorizar somente depois de observar uso e pagamento pelo fluxo central.

- [ ] **Parcerias:** agrupar publicações por campanha, registrar entregas e organizar resultados. Marca, valores e contatos são informados pelo criador, sem presumir que vêm da API.
- [ ] **Relatório de campanha:** compartilhar resultados com período, origem e limitações explícitos; compartilhamento privado e controlado pelo criador.
- [ ] **Mídia kit:** apresentação com informações selecionadas pelo criador e métricas validadas, indicando a data de atualização.
- [ ] **Planejamento leve:** transformar experimentos em uma fila de ideias e registrar o que foi publicado.
- [ ] **Resumo por e-mail:** envio opcional, após validar que a revisão dentro do produto gera valor.
- [ ] **Mais contas ou colaboradores:** considerar apenas se aparecer demanda que justifique permissões, suporte e cobrança adicionais.

## 9. Fora do MVP

- Agendamento e publicação automática, atendimento por mensagens e automação de comentários.
- Marketplace de marcas, negociação de contratos e repasses financeiros.
- Monitoramento amplo de concorrentes, várias redes sociais e ferramentas para agências.
- Chat genérico de IA, geração ilimitada de conteúdo e previsões de viralização.
- Importação de ZIP ou migração automática dos dados do Unveil.
- Scraping, APIs privadas ou coleta sem autorização do titular.

## 10. Próximas ações

1. Escolher um grupo de criadores acessível para as primeiras entrevistas.
2. Preparar roteiro de entrevista e registrar evidências sobre o problema.
3. Validar a leitura mínima necessária na API oficial com conta autorizada.
4. Revisar o MVP com os resultados e prototipar o fluxo principal.
5. Decidir nome e abrir o repositório independente quando começar a implementação.

As fases usam critérios de avanço, sem datas de entrega prometidas. Custos, cronograma e escopo final dependem da descoberta e da viabilidade técnica.
