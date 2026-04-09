# Loja de Camisas de Futebol — API + Painel Admin

Sistema completo para gerenciamento, informação e venda de camisas de times de futebol, com painel administrativo e chat onde o cliente interage com a IA, que usa linguagem natural, para buscar no banco de dados informações sobre camisas.

## O que o projeto faz

- **Catálogo de camisas**: cadastro e consulta de camisas por clube, marca, modelo, ano e preço
- **Busca inteligente**: o usuário digita em linguagem natural ("camisa do Flamengo de 2022") e a IA interpreta a intenção e filtra o banco de dados
- **Chat público com LGPD**: visitantes do site interagem via chat, aceitam o consentimento de dados (nome + cidade) e fazem perguntas sobre o catálogo
- **Controle de acesso por papéis (RBAC)**: três níveis de permissão com controle granular por usuário
- **Painel admin protegido**: gerenciamento completo de camisas e usuários, além de relatório de todas as sessões de chat

## Demo

O projeto está disponível na Vercel como demonstração:

| | Link |
|---|---|
| **Chat** | [aikscf.vercel.app/chat](https://aikscf.vercel.app/chat) |
| **Painel Admin** | [aikscf.vercel.app/login](https://aikscf.vercel.app/login) |

**Credenciais de acesso ao admin:**
- E-mail: `admin@admin.com`
- Senha: `admin123`

---

## Arquitetura

```
projeto-agent-api-camisas/
├── src/        Backend Fastify — API REST + Agente de IA (porta 3333)
└── admin/      Frontend Next.js — Painel admin + Chat público (porta 3000)
```

Ambos compartilham o mesmo banco PostgreSQL (Neon). O frontend chama o backend apenas para processar mensagens do chat via IA.

```
Usuário
  │
  ▼
Next.js (admin/)              ← painel admin + chat público
  │
  ├── Prisma 7 ──────────────► PostgreSQL (Neon)
  │   (ChatSession, ChatMessage,          │
  │    Camisa, User, Session)             │
  │                                       │
  └── fetch POST /camisas/search          │
        │                                 │
        ▼                                 │
     Fastify (src/)                       │
        ├── Google Gemini                 │
        │   (extrai filtros da pergunta)  │
        └── Drizzle ORM ─────────────────┘
            (consulta tabela camisas)
```

---

## Stacks

### Backend (`src/`)

| Tecnologia | Papel |
|---|---|
| **Fastify 5** | Framework HTTP |
| **Drizzle ORM** | Acesso ao banco de dados |
| **PostgreSQL (Neon)** | Banco de dados na nuvem |
| **Google Gemini SDK** (`@google/genai`) | Agente de busca por linguagem natural |
| **Zod 4** | Validação de entrada |
| **TypeScript 6** | Linguagem |

### Frontend (`admin/`)

| Tecnologia | Papel |
|---|---|
| **Next.js 16** (App Router) | Framework fullstack |
| **Prisma 7** | ORM do painel admin e chat |
| **Better Auth** | Autenticação email/senha com suporte a papéis |
| **shadcn/ui** | Componentes de interface |
| **Tailwind CSS 4** | Estilização |
| **Recharts** | Gráficos interativos no relatório |
| **Zod 4** | Validação de formulários e APIs |
| **TypeScript** | Linguagem |

---

## Controle de Acesso (RBAC)

O sistema possui três papéis hierárquicos:

| Papel | Descrição |
|---|---|
| **master** | Acesso total ao sistema, incluindo gerenciar outros masters e admins |
| **admin** | Acesso ao painel, gerencia camisas e usuários comuns |
| **user** | Acesso restrito; permissões configuradas individualmente pelo admin |

### Permissões granulares para `user`

Usuários com papel `user` podem ter permissões específicas ativadas por um admin:

| Permissão | O que permite |
|---|---|
| `canCreateCamisa` | Cadastrar novas camisas |
| `canEditCamisa` | Editar camisas existentes |
| `canDeleteCamisa` | Excluir camisas |
| `canManageUsers` | Gerenciar outros usuários |

As permissões são configuradas na tela de edição de usuário (`/users/[id]`) e armazenadas na tabela `user_permissions`.

### Regras de visibilidade

- **master** vê e gerencia todos os papéis, incluindo outros masters
- **admin** vê apenas admins e users; não pode ver nem editar masters
- **user** acessa apenas o que suas permissões individuais permitem

---

## Relatório de Chat

A rota `/relatorio` exibe análises das sessões de chat públicas. Apenas sessões com perguntas relacionadas a times do catálogo são exibidas.

### Cards de resumo

| Card | O que mostra |
|---|---|
| **Total de Sessões** | Sessões com ao menos uma pergunta sobre times |
| **Total de Perguntas** | Mensagens de usuário que mencionam um time do catálogo |
| **Camisas Pesquisadas** | Quantidade de times distintos pesquisados no chat |
| **Cidades Diferentes** | Número de cidades distintas das sessões filtradas |

### Gráficos interativos

Clicando em **Cidades Diferentes**:
- Gráfico de barras com usuários por cidade (layout vertical ou horizontal conforme quantidade)
- Barras com valor sempre visível

Clicando em **Camisas Pesquisadas**:
- Gráfico horizontal com os **top 50 times** mais pesquisados, ordenado por volume
- Heatmap **Cidade × Time** mostrando concentração de pesquisas por região, com legenda de intensidade e valores visíveis em cada célula

---

## Documentação da API (Swagger)

O backend expõe uma interface Swagger/OpenAPI interativa gerada automaticamente a partir dos schemas Zod de cada rota.

### Como acessar

Com o backend rodando, abra no navegador:

```
http://localhost:3333/docs
```

A UI do Swagger exibe todos os endpoints com seus schemas de entrada e saída, permite testar as requisições diretamente pelo navegador e baixar a spec OpenAPI em JSON:

```
http://localhost:3333/docs/json
```

### Como funciona

| Pacote | Papel |
|---|---|
| `@fastify/swagger` | Gera a spec OpenAPI 3.0 a partir dos schemas das rotas |
| `@fastify/swagger-ui` | Serve a interface visual em `/docs` |
| `fastify-type-provider-zod` | Converte os schemas Zod em JSON Schema para o Swagger |

Cada rota declara seus schemas diretamente usando Zod — sem duplicação de tipos. A conversão é feita automaticamente pelo `jsonSchemaTransform` na inicialização do servidor.

---

## Endpoints do Backend

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/teste` | Health check |
| `POST` | `/camisas` | Cadastra uma camisa |
| `POST` | `/camisas/search` | Busca por linguagem natural via Gemini |

### Exemplo de busca por IA

```bash
curl -X POST http://localhost:3333/camisas/search \
  -H "Content-Type: application/json" \
  -d '{"search": "camisa titular do Flamengo de 2023"}'
```

```json
{
  "reply": "Encontrei 2 camisas no catálogo pra você.",
  "items": [...]
}
```

---

## Rotas do Frontend Admin

| Rota | Tipo | Acesso | Descrição |
|---|---|---|---|
| `/login` | Pública | — | Autenticação |
| `/chat` | Pública | — | Chat com IA + consentimento LGPD |
| `/dashboard` | Protegida | todos | Contadores gerais com atalhos de navegação |
| `/camisas` | Protegida | conforme permissão | CRUD de camisas com filtros e paginação |
| `/camisas/[id]` | Protegida | conforme permissão | Editar camisa |
| `/users` | Protegida | master / admin | CRUD de usuários e configuração de permissões |
| `/relatorio` | Protegida | todos | Relatório de sessões de chat com gráficos |

---

## Como executar

### Pré-requisitos

- Node.js 20+
- Banco PostgreSQL — recomendado [Neon](https://neon.tech) (gratuito)
- Chave de API do Google Gemini — obtida em [Google AI Studio](https://aistudio.google.com) (gratuito)

---

### 1. Backend Fastify

```bash
# Na raiz do projeto
cp example.env .env
```

Preencha o `.env`:

```env
NODE_ENV="development"
PORT=3333
DATABASE_URL="postgresql://usuario:senha@host/banco?sslmode=require"
GEMINI_API_KEY="sua-chave-aqui"
GEMINI_MODEL="gemini-2.5-flash"
```

```bash
npm install

# Aplicar schema no banco
npx drizzle-kit push

# Iniciar o servidor
npm run dev
# Servidor rodando em http://localhost:3333
```

---

### 2. Frontend Next.js (Painel Admin)

```bash
cd admin
```

Crie o arquivo `admin/.env.local`:

```env
DATABASE_URL="postgresql://usuario:senha@host/banco?sslmode=require"
BETTER_AUTH_SECRET="uma-string-aleatoria-com-pelo-menos-32-caracteres"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
BACKEND_URL="http://localhost:3333"
```

Crie também `admin/.env` (necessário para o CLI do Prisma):

```env
DATABASE_URL="postgresql://usuario:senha@host/banco?sslmode=require"
```

```bash
npm install

# Criar as tabelas do painel admin e chat no banco
npx prisma db push

# Popular o banco com usuários e 10 camisas de exemplo
npx tsx prisma/seed.ts

# Iniciar o servidor
npm run dev
# Painel rodando em http://localhost:3000
```

**Credenciais criadas pelo seed:**

| Papel | Email | Senha |
|---|---|---|
| master | `master@master.com` | `master123` |
| admin | `admin@admin.com` | `admin123` |

---

### Ordem de inicialização

```bash
# Terminal 1 — Backend (necessário para o chat funcionar)
npm run dev

# Terminal 2 — Frontend
cd admin && npm run dev
```

> O painel admin funciona normalmente sem o backend. Apenas o chat retornará uma mensagem de fallback caso o Fastify esteja offline.

---

## Banco de dados

O projeto usa **um único banco PostgreSQL** compartilhado entre os dois serviços:

| Prefixo | Tabelas | Gerenciado por |
|---|---|---|
| *(sem prefixo)* | `camisas` | Drizzle (backend) |
| `admin_` | `admin_users`, `admin_sessions`, `admin_accounts`, `admin_verifications` | Prisma + Better Auth |
| *(sem prefixo)* | `chat_sessions`, `chat_messages` | Prisma (frontend) |
| *(sem prefixo)* | `user_permissions` | Prisma (frontend) |
