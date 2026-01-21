# Enterprise Inventory Management System (EIMS)
 
Solução avançada para Gestão de Inventário e Controle Logístico, projetada com foco em rastreabilidade transacional, segurança granular e integridade de dados multi-unidade.

📖 **[Acesse o Manual do Usuário Completo](./MANUAL_USUARIO.md)**

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

---

## Guia de Utilização (Passo a Passo)

Para operar o sistema pela primeira vez, siga este fluxo:

### 1. Acesso Inicial
- Acesse a página de login e utilize as **Credenciais de Teste** (disponíveis ao final deste documento).
- Ao entrar, você será direcionado para o **Dashboard**, onde terá uma visão geral do estoque.

### 2. Cadastrando Unidades
- Vá até o módulo **Unidades**.
- Cadastre os locais físicos (ex: Almoxarifado Central, Unidade Norte). Isso permite que você segmente o estoque por localização.

### 3. Gerenciando o Catálogo (Produtos)
- No módulo **Produtos**, adicione os itens que serão controlados.
- **Importante**: Defina um **Estoque Mínimo**. Quando o saldo cair abaixo desse valor, o sistema gerará alertas automáticos no Dashboard e na Central de Notificações.

### 4. Realizando Movimentações
- Para atualizar o estoque, utilize o módulo **Movimentações**.
- **Entrada**: Use quando receber novos itens (compras, doações).
- **Saída**: Use para registrar o consumo ou distribuição de itens.
- O sistema registra o histórico imutável de quem realizou a ação e quando.

### 5. Monitoramento e Notificações
- Fique atento à **Central de Notificações** (ícone de sino no topo).
- O Dashboard mostrará gráficos em tempo real sobre a distribuição dos produtos e quais itens precisam de reposição urgente.
- **Dica**: Utilize o card de **Ações Rápidas** no final da página inicial para cadastrar produtos ou registrar movimentações com apenas um clique.

### 6. Exportação de Relatórios
- No módulo de **Relatórios**, você pode filtrar movimentações por data ou tipo.
- Utilize o botão de exportação para baixar planilhas **XLSX** ou arquivos **CSV** para auditoria externa.

---

## Módulos do Sistema

- **Auth & RBAC**: Gestão de identidade e perfis (`Admin`, `Operador`, `Consulta`).
- **Unidades**: Gestão de locais físicos de armazenamento.
- **Produtos**: Catálogo mestre com controle de níveis críticos.
- **Movimentações**: Ledger transacional (Audit Trail) de entradas e saídas.
- **Analytics**: Dashboard com KPIs e gráficos dinâmicos.
- **Notificações**: Alertas automáticos de estoque baixo em tempo real.

## Estrutura do Projeto

```
├── app/                  # Rotas, layouts e Server Components (App Router)
│   ├── auth/             # Fluxos de autenticação
│   └── dashboard/        # Módulos principais (Produtos, Relatórios, etc)
├── components/           # UI Components reutilizáveis
├── lib/                  # Clientes (Supabase, Excel) e utilitários
├── scripts/              # Migrations e esquemas SQL
└── middleware.ts         # Segurança e controle de rotas
```

## Setup e Instalação

### Pré-requisitos
- Node.js 18.x+
- Instância do Supabase configurada

### Execução Local

1. **Clone e Instalação**:
   ```bash
   git clone https://github.com/luisitcho/faculdade-mba-es-29-project-bootcamp-2025
   cd faculdade-mba-es-29-project-bootcamp-2025
   npm install
   ```

2. **Variáveis de Ambiente**:
   Crie um arquivo `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
   SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico
   ```

3. **Banco de Dados**:
   Execute os scripts SQL da pasta `/scripts` no editor SQL do Supabase.

4. **Start**:
   ```bash
   npm run dev
   ```

---

## 🌐 Demonstração Online

Acesse a aplicação em produção: [https://v0-simple-inventory-system-red.vercel.app/](https://v0-simple-inventory-system-red.vercel.app/)

### Credenciais de Teste

| Perfil | Usuário | Senha |
| :--- | :--- | :--- |
| **Administrador** | `admin@admin.com` | `admin123` |
| **Consultor** | `consultor@gmail.com` | `123456` |

*Nota: Estas credenciais são destinadas exclusivamente a fins de demonstração e testes.*

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

*Projeto desenvolvido durante o Bootcamp como prática de desenvolvimento web fullstack.*
