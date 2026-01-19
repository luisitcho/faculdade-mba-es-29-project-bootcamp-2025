# Enterprise Inventory Management System (EIMS)
 
Solução avançada para Gestão de Inventário e Controle Logístico, projetada com foco em rastreabilidade transacional, segurança granular e integridade de dados multi-unidade.

## Stack Técnica

### Frontend & Core
- **Next.js 14**: Arquitetura App Router e Server Actions.
- **React 18**: Componentização funcional e Hooks.
- **TypeScript**: Tipagem estática e segurança de tipos.

### UI/UX & Design System
- **Tailwind CSS v4**: Estilização utilitária e responsividade.
- **shadcn/ui**: Componentes de UI baseados em Radix UI.
- **Next Themes**: Gerenciamento de temas (Light/Dark).
- **Lucide React**: Biblioteca de ícones vetoriais.

### Backend & BaaS
- **Supabase**: 
  - **PostgreSQL**: Persistência de dados relacionais.
  - **Auth**: Autenticação via JWT e gestão de sessões.
  - **RLS**: Políticas de acesso em nível de banco de dados.

### Data & Logic
- **React Hook Form**: Gestão de estados de formulário.
- **Zod**: Validação de esquemas e contratos de dados.
- **ExcelJS / json2csv**: Serialização para exportação (XLSX/CSV).
- **Recharts**: Visualização de dados e gráficos.

### Infraestrutura
- **Vercel**: Deployment, CI/CD e Analytics.

## Funcionalidades e Módulos

### Autenticação & RBAC
- Gestão de identidade via **Supabase Auth**.
- Perfis de acesso: `Admin`, `Operador`, `Consulta`.
- Proteção de rotas e APIs via Middleware.

### Gestão de Unidades & Inventário
- Cadastro e CRUD de unidades físicas.
- Controle de estoque segmentado por localização.

### Catálogo & Controle de Estoque
- Categorização de produtos e controle de estoque mínimo.
- Gatilhos para alertas de reposição.
- Movimentação rápida de inventário.

### Auditoria & Relatórios
- Log imutável de entradas e saídas (Audit Trail).
- Exportação de dados em **XLSX/CSV**.
- Dashboard com indicadores (KPIs) e gráficos Recharts.

### Notificações
- Alertas automáticos de estoque crítico.
- Central de notificações em tempo real.

## Segurança

- **Auth**: JWT via Supabase.
- **Data**: Row Level Security (RLS) no PostgreSQL.
- **Routes**: Proteção via Next.js Middleware.
- **Validation**: Validação de schemas com Zod.
- **RBAC**: Controle de permissões granular por nível de usuário.

## Estrutura do Projeto

A organização dos diretórios segue as convenções do Next.js com foco em separação de preocupações:

```
├── app/                  # Rotas, layouts e Server Components (App Router)
│   ├── api/              # Endpoints transacionais e exportação de dados
│   ├── auth/             # Fluxos de autenticação (Login/Cadastro)
│   └── dashboard/        # Módulos principais do sistema (Produtos, Relatórios, etc)
├── components/           # UI Components (Átomos, Moléculas e Organismos)
│   └── ui/               # Componentes base do Design System (Radix/shadcn)
├── lib/                  # Configurações de clientes (Supabase, Excel) e utilitários
├── scripts/              # Migrations e esquemas SQL do banco de dados
├── hooks/                # Custom React Hooks para lógica de estado complexa
└── middleware.ts         # Orquestração de segurança e redirecionamento de rotas
```

## Setup do Ambiente de Desenvolvimento
 
 ### Pré-requisitos
- **Runtime**: Node.js 18.x ou superior.
- **Database Manager**: Acesso administrativo a uma instância **Supabase**.
- **Package Manager**: npm, yarn ou pnpm.
 
### Guia de Instalação
 
1. **Cópia do Repositório**:
 ```bash
 git clone https://github.com/luisitcho/faculdade-mba-es-29-project-bootcamp-2025
 cd faculdade-mba-es-29-project-bootcamp-2025
 ```
 
2. **Gestão de Dependências**:
 ```bash
 npm install
 ```
 
3. **Configuração de Variáveis de Ambiente**:
Crie um arquivo `.env.local` na raiz do projeto:
 ```env
 NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
 NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
 SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico
 ```
 
4. **Provisionamento do Schema (SQL)**:
Execute os artefatos SQL localizados em `/scripts` no SQL Editor do Supabase seguindo a ordem de precedência numérica.
 
5. **Execução do Servidor**:
 ```bash
 npm run dev
 ```
O ambiente estará disponível em `http://localhost:3000`.

## Credenciais de Demonstração (Admin)

- **Identifier**: `admin@admin.com`
- **Passphrase**: `admin123`

*Nota: Estas credenciais são destinadas exclusivamente a ambientes de estúdio e testes.*

## Modelo de Dados (Schema)

- **`profiles`**: Extensão de usuários (roles e vínculos).
- **`unidades`**: Locais de armazenamento.
- **`categorias`**: Classificação de inventário.
- **`produtos`**: Cadastro de itens e níveis críticos.
- **`movimentacoes`**: Histórico de entradas e saídas.
- **`notificacoes`**: Registro de alertas e eventos.

---

## Autores
- André Luis Gnatiuc
- Edimichael das Virgens de Lima
- Luciano de Carvalho
- Luis Henrique de Souza Cruz
- Paulo Simão Barreto
- Rodrigo da Silva Assimos
- Vinicius Fernandes Umbelino dos Santos
- Vitor Fernandes Palha
- Vitor Pereira Rocha

Projeto desenvolvido durante o Bootcamp como prática de desenvolvimento web fullstack.
