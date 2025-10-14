# Sistema de Gestão de Estoque

Sistema completo de gerenciamento de estoque com controle de produtos, movimentações, usuários e unidades.

## Tecnologias Utilizadas

### Frontend
- **[Next.js 15](https://nextjs.org/)** - Framework React com App Router
- **[React 19](https://react.dev/)** - Biblioteca para construção de interfaces
- **[TypeScript](https://www.typescriptlang.org/)** - Superset JavaScript com tipagem estática
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Framework CSS utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes de UI reutilizáveis
- **[Lucide React](https://lucide.dev/)** - Biblioteca de ícones

### Backend & Banco de Dados
- **[Supabase](https://supabase.com/)** - Backend as a Service (BaaS)
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[Supabase Auth](https://supabase.com/auth)** - Sistema de autenticação
- **[Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)** - Segurança em nível de linha

### Visualização de Dados
- **[Recharts](https://recharts.org/)** - Biblioteca de gráficos para React

### Hospedagem & Deploy
- **[Vercel](https://vercel.com/)** - Plataforma de hospedagem e deploy

## 📋 Funcionalidades

### Gestão de Usuários
- Sistema de autenticação com Supabase
- Perfis de acesso (Admin, Operador, Consulta)
- Controle de permissões por perfil
- Gerenciamento de usuários (apenas para admins)

### Gestão de Unidades
- Cadastro de unidades/locais
- Visualização de produtos por unidade
- Controle de estoque por localização

### Gestão de Produtos
- Cadastro de produtos por categoria
- Categorias: Alimentação, Higiene/Limpeza, Pedagógico, Bens
- Controle de estoque mínimo
- Alertas de estoque baixo
- Edição rápida de quantidades
- Vinculação de produtos a unidades

### Controle de Movimentações
- Registro de entradas de produtos
- Registro de saídas de produtos
- Histórico completo de movimentações
- Atualização automática de estoque
- Filtros por tipo, produto e data

### Dashboard & Relatórios
- Dashboard com estatísticas em tempo real
- Gráficos de estoque por categoria
- Relatórios de produtos
- Relatórios de movimentações
- Exportação de relatórios em Excel/CSV
- Produtos com estoque baixo

### Notificações
- Sistema de alertas automáticos
- Notificações de estoque baixo
- Notificações de movimentações importantes
- Central de notificações
- Notificações em tempo real

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+ instalado
- Conta no Supabase
- Conta no Vercel (para deploy)

### Configuração Local

1. Clone o repositório:
\`\`\`bash
git clone <url-do-repositorio>
cd inventory-system
\`\`\`

2. Instale as dependências:
\`\`\`bash
npm install
\`\`\`

3. Configure as variáveis de ambiente:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico
\`\`\`

4. Execute os scripts SQL na ordem:
- `001_create_tables.sql` - Cria as tabelas principais
- `002_create_profile_trigger.sql` - Cria triggers de perfil
- `003_create_notifications.sql` - Cria sistema de notificações
- `014_create_unidades.sql` - Cria tabela de unidades
- `013_create_luis_admin.sql` - Cria usuário admin

5. Inicie o servidor de desenvolvimento:
\`\`\`bash
npm run dev
\`\`\`

6. Acesse http://localhost:3000

## Acesso Padrão

**Usuário Admin:**
- Email: luishenrisc1@gmail.com
- Senha: 123456

## Estrutura do Projeto

\`\`\`
├── app/
│   ├── auth/              # Páginas de autenticação
│   ├── dashboard/         # Páginas do painel
│   │   ├── produtos/      # Gestão de produtos
│   │   ├── movimentacoes/ # Controle de movimentações
│   │   ├── relatorios/    # Relatórios e gráficos
│   │   ├── usuarios/      # Gestão de usuários
│   │   ├── unidades/      # Gestão de unidades
│   │   └── notificacoes/  # Central de notificações
│   └── globals.css        # Estilos globais
├── components/            # Componentes reutilizáveis
├── lib/                   # Utilitários e configurações
│   ├── supabase/         # Clientes Supabase
│   └── excel-export.ts   # Exportação de relatórios
├── scripts/              # Scripts SQL do banco de dados
└── middleware.ts         # Middleware de autenticação
\`\`\`

## Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) em todas as tabelas
- Middleware de proteção de rotas
- Controle de permissões por perfil
- Validação de dados no servidor

## Banco de Dados

### Tabelas Principais
- `profiles` - Perfis de usuários
- `unidades` - Unidades/locais
- `categorias` - Categorias de produtos
- `produtos` - Produtos cadastrados
- `movimentacoes` - Histórico de movimentações
- `notificacoes` - Sistema de notificações

## Deploy

O projeto está configurado para deploy automático no Vercel:

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. O deploy será feito automaticamente a cada push

## Como Executar o Projeto
1. Clone este repositório:
   ```bash
   git clone https://github.com/luisitcho/faculdade-mba-es-29-project-bootcamp-2025
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse no navegador:
   ```
   http://localhost:3000
   ```

---

## Credenciais de Teste
Para acessar o sistema com perfil **Administrador**, utilize as credenciais abaixo:

- **Usuário:** `admin@admin.com`  
- **Senha:** `admin123`  

Essas credenciais são fornecidas apenas para fins de **demonstração e testes**.

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
