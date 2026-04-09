# Área Administrativa — Next.js, Better Auth, shadcn/ui

## Objetivo

Criar uma área administrativa completa com **Next.js 15** (App Router, TypeScript), utilizando **Better Auth** para autenticação, **shadcn/ui** para interface e **lucide-react** para ícones.

O sistema deve permitir **CRUD de usuários** e **CRUD de camisas**, seguindo a estrutura de banco definida abaixo.

---

## Esquema do Banco de Dados (Prisma)

### Tabela `users`

Gerada pelo Better Auth com campos extras:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          String    @default("user") // "admin" ou "user"
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions      Session[]
  accounts      Account[]
}
```

### Tabela `camisas`

```prisma
model Camisa {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  club      String   @db.VarChar(120)
  brand     String   @db.VarChar(80)
  model     String   @db.VarChar(120)
  year      Int
  price     Decimal  @db.Decimal(12, 2)
  imageUrl  String?  @db.VarChar(2048)
  createdAt DateTime @default(now()) @db.Timestamptz
  updatedAt DateTime @default(now()) @db.Timestamptz
}
```

> **Observação:** Utilize PostgreSQL com Prisma. Os nomes seguem as convenções do Prisma (camelCase).

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (admin)/
│   │   ├── layout.tsx              # Layout com Sidebar e Header (protegido)
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── users/
│   │   │   ├── page.tsx            # Listagem de usuários
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Editar usuário
│   │   └── camisas/
│   │       ├── page.tsx            # Listagem de camisas
│   │       └── [id]/
│   │           └── page.tsx        # Editar camisa
│   └── api/
│       └── auth/
│           └── [...all]/
│               └── route.ts
├── components/
│   ├── ui/                         # Componentes shadcn/ui
│   ├── admin/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── user-form.tsx
│   │   ├── camisa-form.tsx
│   │   ├── user-table.tsx
│   │   └── camisa-table.tsx
│   └── auth/
│       └── login-form.tsx
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── actions/
│   │   ├── user-actions.ts
│   │   └── camisa-actions.ts
│   └── validations/
│       ├── user-schema.ts
│       └── camisa-schema.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── middleware.ts
└── .env
```

---

## Autenticação com Better Auth

- Configurar `better-auth` com Prisma adapter
- Criar rotas API em `app/api/auth/[...all]/route.ts`
- Exportar cliente em `lib/auth.ts`
- Usar `middleware.ts` para proteger todas as rotas dentro de `/(admin)`
- Página de login com formulário usando Server Actions ou chamada cliente
- Verificar se o usuário logado tem `role: "admin"` — caso contrário, retornar 403 ou redirecionar

---

## CRUD de Usuários

### Atributos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `name` | string | Nome do usuário |
| `email` | string | E-mail único |
| `role` | enum | `"admin"` ou `"user"` |

> Campos de autenticação (senha, sessão, conta) são gerenciados pelo Better Auth.

### Funcionalidades

- Listagem com paginação, ordenação e busca por nome/e-mail
- Criar usuário: formulário com `name`, `email`, `password` (hash pelo Better Auth) e `role`
- Editar usuário: alterar `name`, `email`, `role` (senha opcional)
- Deletar usuário com confirmação
- Apenas administradores podem executar ações (validação no servidor)

---

## CRUD de Camisas

### Atributos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `club` | string | Clube |
| `brand` | string | Marca |
| `model` | string | Modelo (`titular`, `reserva`, `camisa 3`, `treino`, `viagem`) |
| `year` | integer | Ano |
| `price` | decimal (12,2) | Preço |
| `imageUrl` | string (opcional) | URL da imagem |

### Funcionalidades

- Listagem com todos os campos, incluindo imagem em miniatura
- Criar camisa: formulário com todos os campos e validação com Zod
- Editar camisa: carregar dados atuais e atualizar
- Deletar camisa com confirmação
- Filtrar por clube, marca ou ano

---

## Interface com shadcn/ui

### Componentes utilizados

| Componente | Uso |
|-----------|-----|
| `Table` | Listagens de usuários e camisas |
| `Form` + `Input` + `Select` | Formulários de criação/edição |
| `Dialog` | Modais de confirmação de exclusão |
| `DropdownMenu` | Ações por linha na tabela |
| `Button` | Ações gerais |
| `Skeleton` | Loading states |
| `Toast` | Feedback de ações |

### Layout

- **Sidebar** com links: Dashboard, Usuários, Camisas (item ativo destacado)
- **Header** com nome do usuário e botão de logout (dropdown)
- **Tabelas** responsivas com ações de editar e deletar por linha
- **Ícones** via `lucide-react` no sidebar e botões

---

## Boas Práticas React/Next.js

- **Server Components** por padrão para páginas de listagem e detalhes
- **Server Actions** para todas as mutações (create, update, delete) com `revalidatePath`
- **Client Components** apenas onde há interatividade (formulários, modais, filtros)
- **Zod** para validação nos schemas e ações
- **TypeScript** com tipagem total inferida do Prisma
- **Tratamento de erros**: `try/catch` retornando `{ success, error }` com feedback via toast
- **Loading states**: `Suspense` + `Skeleton` para carregamento de listas
- **Middleware**: proteger rotas e verificar role de admin
- **Variáveis de ambiente**: `DATABASE_URL`, `BETTER_AUTH_SECRET`, etc.

---

## Exemplo de Server Action

```typescript
// lib/actions/camisa-actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { camisaSchema } from '@/lib/validations/camisa-schema';
import { requireAdmin } from '@/lib/auth';

export async function createCamisa(data: unknown) {
  await requireAdmin();

  const parsed = camisaSchema.parse(data);
  await prisma.camisa.create({ data: parsed });
  revalidatePath('/admin/camisas');
}
```

---

## Seed

Incluir um seed que cria:

- Usuário admin padrão: `admin@admin.com` / `admin123`
- Algumas camisas de exemplo dos times da Série A

---

## Variáveis de Ambiente

```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="seu-secret-aqui"
BETTER_AUTH_URL="http://localhost:3000"
```
