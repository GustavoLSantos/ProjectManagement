# Uso de IA no Desenvolvimento

## Ferramenta Utilizada

**Claude (Anthropic)** via **Claude Code** (CLI) e **Cowork**, com o modelo `claude-sonnet-4-6` como assistente principal durante o desenvolvimento. O Claude Code permitiu delegar tarefas de geração de código diretamente no terminal, com contexto do repositório. O Cowork foi utilizado para planejamento da arquitetura, definição de prompts e revisão das decisões técnicas antes de cada fase de implementação.

---

## Para Quais Partes Utilizei IA

A IA foi utilizada em todas as fases de implementação, com graus variados de supervisão:

**Fase 1 — Modelagem do backend:** geração da entidade TypeORM (`Project`), enums de status e risco, DTOs de criação/atualização/resposta e o repositório (`ProjectRepository`). A IA produziu o esqueleto inicial; a revisão manual garantiu que os tipos de coluna (`numeric`, `date`, `enum`) estivessem corretos para PostgreSQL.

**Fase 2 — Regras de negócio (`ProjectsService`):** implementação das regras de cálculo de risco, validação de transições de status e restrição de exclusão. Esta foi a fase de maior supervisão: cada regra foi comparada ponto a ponto com o enunciado antes de ser aceita.

**Fase 3 — Testes unitários BDD (backend):** geração do arquivo `projects.service.spec.ts` com estrutura de `describe`/`it` em português, mock completo do `ProjectRepository` e 19 cenários cobrindo as três seções de regras de negócio.

**Fase 4 — Camada de serviço do frontend:** tipos TypeScript (`project.ts`), instância axios com interceptor de erros (`api.ts`) e funções tipadas do serviço de projetos (`projectsService.ts`).

**Fase 5 — Componentes React:** `StatusBadge`, `RiskBadge`, `ProjectsListPage` (com tabela, estados de loading/vazio/erro e exclusão), `ProjectForm` (criação e edição com validações client-side) e `ProjectDetailModal` (ações de status e análise de IA).

**Fase 6 — Módulo de IA:** implementação do `AiModule` com `AiAnalysisService`, `AiClient` (integração com Groq via SDK) e `ProjectAnalysisPromptBuilder`. O prompt solicita à IA um JSON estruturado com `summary`, `attentionPoints` e `executiveRecommendation` com base nos dados do projeto.

**Fase 7 — Testes de componentes React (frontend):** geração dos arquivos de teste com Vitest e Testing Library para `ProjectForm`, `ProjectsListPage` e `ProjectDetailModal`. Os testes foram criados para refletir o comportamento real dos componentes — quando havia divergência entre o teste gerado e o comportamento existente, o teste era ajustado, nunca o componente.

**Fase 8 — Deploy:** configuração do deploy do frontend no Vercel e do backend no Railway, com banco de dados PostgreSQL no Supabase. A IA auxiliou no diagnóstico e resolução dos problemas encontrados durante o processo.

---

## Principais Prompts Utilizados

Os prompts abaixo descrevem o que foi pedido em cada fase. O texto exato pode variar do que foi digitado, mas reflete a intenção de cada solicitação.

**[Fase 1 — Entidade e DTOs]**
> Criação da entidade `Project` com TypeORM para PostgreSQL, incluindo os enums `ProjectStatus` e `RiskLevel`, DTOs de criação/atualização/resposta com validações `class-validator` e Swagger, e um `ProjectRepository` com os métodos CRUD básicos.

**[Fase 2 — Service com regras de negócio]**
> Implementação do `ProjectsService` com: cálculo de risco baseado em orçamento e prazo (limites R$100k / R$500k e 3 / 6 meses), validação de transições de status via mapa de transições permitidas, e bloqueio de exclusão para projetos `Em andamento` ou `Encerrados`.

**[Fase 3 — Testes BDD backend]**
> Criação de `projects.service.spec.ts` com Jest em estilo BDD, organizando os testes em `describe` aninhados em português, mockando o `ProjectRepository` inteiramente com `jest.fn()` e testando o `calculateRisk` privado indiretamente via `create()`.

**[Fase 4 — Camada de serviço frontend]**
> Criação de `src/types/project.ts` com interfaces alinhadas ao backend, `src/services/api.ts` com instância axios e interceptor de erros extraindo `data.message`, e `src/services/projectsService.ts` com as 7 funções tipadas (incluindo `getAiAnalysis`).

**[Fase 5a — Tela de listagem]**
> Criação de `ProjectsListPage.tsx` com tabela de projetos, badges de status e risco, formatação BRL e de datas, estados de loading/vazio/erro com retry, e exclusão com confirmação e feedback inline por linha.

**[Fase 5b — Formulário e modal]**
> Criação de `ProjectForm.tsx` com validações client-side (campos obrigatórios, data de término > início, orçamento > 0) e suporte a criação e edição via prop opcional `project`. Criação de `ProjectDetailModal.tsx` com ações de status, lógica de transições, e seção de análise de IA com cache local, loading e tratamento de erro.

**[Fase 6 — Módulo de IA]**
> Implementação do `AiModule` com separação em três classes: `ProjectAnalysisPromptBuilder` (monta o prompt com os dados do projeto), `AiClient` (chama a API do Groq via SDK e retorna o texto gerado) e `AiAnalysisService` (orquestra os dois, faz parse do JSON e lança `InternalServerErrorException` em caso de falha). Integração com o endpoint `GET /projects/:id/ai-analysis` no controller.

**[Fase 7 — Testes de componentes React]**
> Criação de testes com Vitest e @testing-library/react para `ProjectForm` (validações client-side), `ProjectsListPage` (estados de loading, vazio e erro, renderização da lista, exclusão) e `ProjectDetailModal` (renderização dos dados, visibilidade condicional dos botões de status e cancelamento, fluxo de análise de IA com loading e erro). Instrução explícita de que o código de produção não deveria ser alterado — qualquer divergência deveria ser resolvida ajustando o teste para refletir o comportamento real.

---

## O Que Foi Aceito, Ajustado ou Descartado

**Aceito sem alteração:** a estrutura de mocks do spec com `jest.Mocked<ProjectRepository>` e o helper `buildProject()`, os interceptors do axios, os estados de UI do modal de detalhes, a lógica de comparação de datas ISO via string para validação do formulário.

**Ajustado após revisão:** o cálculo de risco gerado inicialmente não aplicava `Number(budget)` antes de comparar — corrigido para lidar com o comportamento do driver `pg` que retorna colunas `numeric` como strings. A validação de transição de status foi revisada para confirmar que `Cancelado` é sempre permitido independente do status atual, conforme o enunciado.

**Ajustes manuais necessários após geração:** quatro pontos não foram cobertos pela IA e precisaram de intervenção manual:
- O `main.ts` foi gerado sem a configuração do Swagger — adicionado `DocumentBuilder` e `SwaggerModule.setup('api', app, document)` manualmente antes do `app.listen()`.
- O `App.tsx` foi gerado com o template padrão do Vite, sem importar os componentes criados — substituído manualmente para renderizar a `ProjectsListPage` e integrar os modais.
- O CORS não foi habilitado no `main.ts` — adicionado `app.enableCors()` manualmente, com origins expandidas durante o deploy para cobrir o domínio de produção do Vercel e previews de branch.
- O `index.html` estava com título `"frontend"` e favicon padrão do Vite — corrigidos manualmente para `"ProjectManagement"` e favicon customizado.

**Ajustes durante o deploy:**
- A connection string do Supabase usava conexão direta (IPv6 por padrão), incompatível com o Railway que opera em IPv4. Resolvido trocando para o modo **Session pooler** do Supabase, que roteia via IPv4.
- O build do Vercel falhou com `TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled` — corrigido desabilitando `erasableSyntaxOnly` no `tsconfig.app.json`.
- A `VITE_API_URL` foi configurada sem o protocolo `https://`, fazendo o axios tratar a URL como caminho relativo — corrigido adicionando o protocolo completo na variável de ambiente do Vercel.
- O CORS precisou ser expandido para aceitar subdomínios do Vercel via regex (`/https:\/\/.*\.vercel\.app$/`) pois os deploys de preview geram URLs dinâmicas diferentes da URL de produção.

**Descartado:** uma sugestão inicial de usar `@nestjs/testing` e `Test.createTestingModule()` nos testes unitários foi descartada em favor de instanciação direta (`new ProjectsService(mockRepository)`) — mais simples, sem overhead de container IoC para testes puros de lógica de negócio.

---

## Decisões Técnicas Tomadas pelo Candidato

**PostgreSQL + Supabase:** a escolha do banco foi definida antes de iniciar o desenvolvimento pela compatibilidade direta com Supabase para deploy sem adaptações.

**BDD nos testes de backend:** decisão tomada ao ler o enunciado, que descrevia as regras em formato de critérios de aceitação. Os prompts para os testes foram escritos com a estrutura BDD já especificada.

**Testes de componentes React orientados ao comportamento real:** a instrução central passada à IA para os testes do frontend foi que o código de produção não deveria ser tocado — os testes deveriam se adaptar ao que o componente já fazia, não o contrário. Isso garantiu que os testes documentassem o comportamento existente em vez de forçar refatorações desnecessárias.

**Groq (llama-3.1-8b-instant) como provider de IA:** a integração real com IA foi escolhida como diferencial em vez do mock. O Groq foi selecionado por oferecer um free tier funcional com latência baixa e API simples, adequada ao escopo da análise (dados de um único projeto, output de 3 campos estruturados). A troca do SDK Anthropic pelo Groq ocorreu após identificar que a conta Anthropic utilizada não possuía créditos disponíveis — decisão pragmática para manter a integração real sem comprometer o prazo.

**Deploy Frontend (Vercel) + Backend (Railway) + Banco (Supabase):** arquitetura de deploy escolhida pela disponibilidade de free tiers funcionais em cada camada. O Supabase ficou com o banco, o Railway com o backend NestJS e o Vercel com o frontend React — cada serviço no que faz melhor.

**Estrutura de camadas do frontend:** a separação em `types/`, `services/` e `components/` foi definida antes de gerar qualquer código frontend, garantindo que os tipos fossem a fonte de verdade compartilhada entre serviço e componentes.

**Sem biblioteca de UI:** a decisão de usar CSS com variáveis CSS nativas foi tomada para manter o projeto sem dependências pesadas, facilitando avaliação do código gerado e garantindo controle total sobre o design system.

---

## Limitações da Entrega

**`synchronize: true`:** o schema do banco é sincronizado automaticamente a cada start. Adequado para avaliação, mas inadequado para produção — em um ambiente real seria substituído por migrations controladas.