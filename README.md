# Project Management

Aplicação web para gerenciamento de projetos com cálculo automático de risco e análise inteligente gerada por IA.

🔗 **[Acessar plataforma](https://project-management-ten-peach.vercel.app)**

---

## O que o sistema faz

### Visão geral dos projetos
Dashboard com cards de contagem por status e tabela completa de projetos, com badges visuais de status e risco calculado automaticamente.

<img width="1182" height="683" alt="Captura de Tela 2026-06-30 às 12 16 09" src="https://github.com/user-attachments/assets/293edb8e-a3e4-46d1-b889-d2f7e0aab93e" />

### Criação e edição
Formulário com validações client-side: campos obrigatórios, data de término posterior à de início e orçamento positivo. O status inicial é definido automaticamente como "Em análise".

<img width="574" height="508" alt="Captura de Tela 2026-06-30 às 12 18 31" src="https://github.com/user-attachments/assets/2911a4da-50e4-420c-997e-7cd4b5637027" />

### Detalhe e controle de status
Painel lateral com todos os dados do projeto, ações para avançar o status (respeitando o fluxo obrigatório) e opção de cancelamento.

<img width="620" height="465" alt="Captura de Tela 2026-06-30 às 12 18 58" src="https://github.com/user-attachments/assets/c571924c-398f-4887-b890-ebf0056e8160" />

### Análise de risco com IA
A partir dos dados do projeto, a IA gera um resumo executivo, pontos de atenção e uma recomendação — tudo sob demanda, diretamente no painel de detalhes.

<img width="582" height="338" alt="Captura de Tela 2026-06-30 às 12 19 26" src="https://github.com/user-attachments/assets/edee9754-4b5d-4468-ad9c-6a2f6fd451b2" />

---

## Funcionalidades

- Cadastro, edição e exclusão de projetos
- Cálculo automático de risco (Baixo / Médio / Alto) baseado em orçamento e prazo
- Fluxo de status com transições controladas: Em análise → Aprovado → Em andamento → Encerrado
- Cancelamento disponível a partir de qualquer status
- Bloqueio de exclusão para projetos Em andamento ou Encerrados
- Análise textual gerada por IA com resumo, pontos de atenção e recomendação executiva
- API documentada via Swagger

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Backend | NestJS + TypeScript |
| Banco de dados | PostgreSQL (Supabase) |
| ORM | TypeORM |
| IA | Groq API (llama-3.1-8b-instant) |
| Deploy | Vercel (frontend) + Railway (backend) |

---

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- Uma instância PostgreSQL (local ou via [Supabase](https://supabase.com))
- Chave de API do [Groq](https://console.groq.com) (gratuito)

### Backend

```bash
cd backend

cp .env.example .env
# Preenche DATABASE_URL e GROQ_API_KEY no .env

npm install
npm run start:dev
```

Servidor disponível em `http://localhost:3000`.  
Documentação da API (Swagger) em `http://localhost:3000/api`.

### Frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend disponível em `http://localhost:5173`.

---

## Variáveis de ambiente

### Backend (`backend/.env`)

| Variável | Descrição | Obrigatório |
|---|---|---|
| `DATABASE_URL` | Connection string do PostgreSQL: `postgresql://user:password@host:5432/dbname` | ✅ |
| `GROQ_API_KEY` | Chave de API do Groq para o endpoint de análise com IA | ✅ |
| `PORT` | Porta do servidor (padrão: `3000`) | ❌ |

### Frontend (`frontend/.env`)

| Variável | Descrição | Obrigatório |
|---|---|---|
| `VITE_API_URL` | URL base da API (padrão: `http://localhost:3000`) | ❌ |

---

## Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/projects` | Lista todos os projetos |
| `POST` | `/projects` | Cria um novo projeto |
| `GET` | `/projects/:id` | Busca projeto por ID |
| `PATCH` | `/projects/:id` | Atualiza dados do projeto |
| `DELETE` | `/projects/:id` | Remove o projeto |
| `PATCH` | `/projects/:id/status` | Avança o status |
| `GET` | `/projects/:id/ai-analysis` | Gera análise com IA |

Documentação interativa completa em `/api` (Swagger UI).

---

## Testes

### Backend

```bash
cd backend
npm run test
```

Testes unitários das regras de negócio em estilo BDD, cobrindo cálculo de risco, transições de status e restrições de exclusão.

### Frontend

```bash
cd frontend
npm run test
```

Testes dos componentes React com Vitest e Testing Library, cobrindo `ProjectForm` (validações), `ProjectsListPage` (estados de loading, vazio e erro) e `ProjectDetailModal` (ações de status e análise de IA).
