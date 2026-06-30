# Project Management

Aplicação full-stack para gerenciamento de projetos com análise de risco automatizada. O backend expõe uma API REST construída em NestJS com TypeORM, oferecendo operações de CRUD, controle de transições de status e cálculo de risco determinístico (baseado em orçamento e prazo). O frontend, em React + Vite, consome essa API e exibe os projetos em uma tabela com badges visuais de status e risco, formulário de criação/edição e um modal de detalhes que inclui ações de status e análise qualitativa de risco gerada por IA.

---

## Decisões Técnicas

**PostgreSQL** foi escolhido por ser production-ready desde o início: suporta o tipo `numeric` com precisão para campos de orçamento, tem transações robustas e é compatível diretamente com Supabase — o que significa que o deploy pode ser feito sem nenhuma adaptação no código, apenas trocando a variável `DATABASE_URL`.

**BDD nos testes unitários** foi uma escolha natural dado o enunciado do problema: as regras de negócio estavam escritas em linguagem natural com exemplos explícitos ("orçamento acima de R$500.000 = risco alto", "Em análise → Aprovado é permitido"). Traduzir esses cenários para `describe`/`it` em português preserva a rastreabilidade entre a especificação e o código, tornando os testes legíveis para qualquer pessoa — não apenas para desenvolvedores.

**Claude Haiku** foi escolhido para a análise de risco via IA por oferecer o melhor equilíbrio entre custo e qualidade para o caso de uso em questão: extração de dados estruturados a partir de um contexto curto e bem definido. A análise não exige raciocínio de múltiplos passos nem janela de contexto longa, o que torna modelos maiores desnecessariamente caros para esse endpoint.

---

## Como rodar localmente

### Pré-requisitos

- Node.js 18 ou superior
- Uma instância PostgreSQL disponível (local ou via [Supabase](https://supabase.com))

### Backend

```bash
cd backend

# 1. Copiar as variáveis de ambiente
cp .env.example .env

# 2. Preencher as variáveis no arquivo .env
#    DATABASE_URL=postgresql://user:password@host:5432/dbname
#    PROJECT_MANAGEMENT_API_KEY=sk-ant-...

# 3. Instalar dependências
npm install

# 4. Subir em modo desenvolvimento (hot-reload)
npm run start:dev
```

O servidor iniciará em `http://localhost:3000`.

### Frontend

```bash
cd frontend

# 1. Instalar dependências
npm install

# 2. (Opcional) Criar .env local se a API não estiver em localhost:3000
#    echo "VITE_API_URL=http://localhost:3000" > .env

# 3. Subir em modo desenvolvimento
npm run dev
```

O frontend iniciará em `http://localhost:5173` (ou na próxima porta disponível).

---

## Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável | Descrição | Obrigatório |
|---|---|---|
| `DATABASE_URL` | Connection string do PostgreSQL no formato `postgresql://user:password@host:5432/dbname` | ✅ Sim |
| `PROJECT_MANAGEMENT_API_KEY` | Chave de API da Anthropic para o endpoint de análise de risco via IA | ✅ Sim (para o endpoint `/ai-analysis`) |
| `PORT` | Porta em que o servidor escuta (padrão: `3000`) | ❌ Não |

### Frontend (`frontend/.env`)

| Variável | Descrição | Obrigatório |
|---|---|---|
| `VITE_API_URL` | URL base da API (padrão: `http://localhost:3000`) | ❌ Não |

---

## Endpoints da API

A documentação interativa completa está disponível via Swagger UI em:

```
http://localhost:3000/api
```

> **Nota:** para ativar o Swagger, adicione a configuração do `SwaggerModule` ao `src/main.ts` usando o pacote `@nestjs/swagger` (já incluído nas dependências).

### Resumo dos endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/projects` | Lista todos os projetos |
| `POST` | `/projects` | Cria um novo projeto |
| `GET` | `/projects/:id` | Busca um projeto por ID |
| `PATCH` | `/projects/:id` | Atualiza dados de um projeto |
| `DELETE` | `/projects/:id` | Remove um projeto |
| `PATCH` | `/projects/:id/status` | Avança o status do projeto |
| `GET` | `/projects/:id/ai-analysis` | Retorna análise de risco gerada por IA |

---

## Limitações Conhecidas

**Sem autenticação:** a API não implementa nenhuma camada de autenticação ou autorização. Qualquer cliente com acesso à rede pode ler, criar, editar e excluir projetos. Para uso em produção, seria necessário adicionar autenticação (ex.: JWT via `@nestjs/jwt`).

**PostgreSQL obrigatório:** a aplicação não possui suporte a SQLite ou outros bancos relacionais sem alteração no código. É necessário ter uma instância PostgreSQL acessível antes de iniciar o backend.

**Análise de IA síncrona:** o endpoint `/ai-analysis` realiza a chamada à API da Anthropic de forma síncrona na requisição HTTP. Para projetos com alta carga, o ideal seria processar isso de forma assíncrona com uma fila (ex.: BullMQ).

**`synchronize: true` no TypeORM:** a configuração atual sincroniza o schema automaticamente a cada inicialização. Isso é adequado para desenvolvimento mas **deve ser desabilitado em produção**, substituído por migrations explícitas.
