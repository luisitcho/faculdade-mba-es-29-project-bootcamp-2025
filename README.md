
# Project Bootcamp 2025
### MBA Engenharia de Software

## Sistema de Estoque - Project Bootcamp

URL do Projeto: [https://project-bootcamp-inventory-system.vercel.app/](https://project-bootcamp-inventory-system.vercel.app/)

## Descrição
Este projeto é um Sistema de Estoque desenvolvido para gerenciar itens por categoria, controlar movimentações, gerar relatórios e oferecer alertas inteligentes. Foi projetado para ser acessível em diversos dispositivos, com interface responsiva e autenticação segura.

---

## Requisitos Funcionais

### 1. Gestão de Estoque por Categoria
- Cadastrar, editar e excluir itens de estoque por categoria (Alimentação, Higiene/Limpeza, Pedagógico, Bens).
- Definir quantidade mínima e máxima para cada item.
- Acompanhamento de entradas e saídas de produtos.
- Movimentação de estoque.

### 2. Movimentação de Estoque
- Registrar entrada de novos produtos (compra/doação).
- Registrar saída (uso, distribuição, baixa).
- Histórico de movimentações com data, responsável e quantidade.

### 3. Controle de Usuários e Perfis de Acesso
- Usuários com diferentes níveis de permissão (Administrador, Operador, Consultor).
- Autenticação segura (login/senha ou autenticação de dois fatores).

### 4. Relatórios e Consultas
- Relatório por categoria.
- Relatório de consumo por período.
- Relatório de estoque atual (itens críticos, em falta, em excesso).
- Exportação em PDF/Excel.

### 5. Acesso Remoto
- Disponível via navegador em computadores e dispositivos móveis.
- Interface responsiva (PC, tablet, celular).

### 6. Alertas e Notificações
- Aviso de estoque baixo (abaixo do mínimo definido).
- Aviso de validade de produtos próximos do vencimento (no caso de alimentação).

---

## Tecnologias Utilizadas
- **Frontend:** React.js / Next.js
- **Backend:** Node.js / Express
- **Banco de Dados:** MongoDB / MySQL (dependendo da implementação)
- **Hospedagem:** Vercel

---

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
