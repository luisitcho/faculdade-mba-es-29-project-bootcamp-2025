# Manual do Usuário - Sistema de Gestão de Estoque (EIMS)

Bem-vindo ao manual do usuário do **Enterprise Inventory Management System**. Este documento foi criado para orientar você em todas as etapas de utilização do sistema, desde o primeiro acesso até a geração de relatórios avançados.

---

## 1. Acesso ao Sistema

### 1.1 Login
Para acessar o sistema:
1. Insira seu **E-mail** e **Senha** na página inicial.
2. Clique em **Entrar**.
3. Caso esqueça sua senha, entre em contato com o administrador do sistema.

### 1.2 Dashboard (Painel Inicial)
Ao carregar o sistema, você verá o Dashboard com indicadores em tempo real:
- **Total de Produtos**: Quantidade de itens cadastrados no catálogo.
- **Usuários Ativos**: Número de pessoas com acesso ao sistema.
- **Estoque Baixo**: Alerta visual para itens que atingiram o limite mínimo.
- **Movimentações Hoje**: Resumo de entradas e saídas do dia atual.
- **Gráficos**: Visualização da distribuição de produtos por categoria.

---

## 2. Gestão de Produtos

Este módulo permite controlar o catálogo de materiais.

### 2.1 Cadastrar Novo Produto
1. No menu lateral ou no card de **Ações Rápidas**, clique em **Novo Produto**.
2. Preencha o nome, categoria e unidade de medida.
3. **Defina o Estoque Mínimo**: Este valor é crucial para que o sistema saiba quando te avisar que o produto está acabando.
4. Clique em **Salvar**.

### 2.2 Consultar e Editar
- Na lista de produtos, você pode usar a barra de busca para encontrar itens pelo nome.
- Clique em **Editar** (ícone de lápis) para atualizar informações ou ajustar o estoque mínimo.

---

## 3. Gestão de Unidades

As unidades representam os locais físicos onde os produtos estão armazenados (ex: Almoxarifado, Sala de Aula, Unidade Norte).

1. Acesse o menu **Unidades**.
2. Cadastre cada local de armazenamento.
3. Ao visualizar uma unidade, o sistema filtrará automaticamente apenas os produtos vinculados a esse local.

---

## 4. Movimentações (Entradas e Saídas)

É aqui que o estoque "ganha vida". Toda alteração na quantidade física deve ser registrada.

### 4.1 Registrar Entrada
- Use quando chegar uma nova compra ou doação.
- Selecione o produto, a quantidade e a unidade de destino.
- O saldo do produto será incrementado automaticamente.

### 4.2 Registrar Saída
- Use quando um item for consumido ou retirado do estoque.
- Informe o motivo nas observações para manter a rastreabilidade.
- O saldo do produto será decrementado automaticamente.

---

## 5. Notificações e Alertas

O sistema monitora seu estoque 24h por dia.
- **Alerta no Dashboard**: Produtos abaixo do mínimo aparecem em destaque na cor laranja/vermelha.
- **Central de Notificações**: Clique no ícone de sino (topo superior) para ver alertas históricos de movimentações críticas e baixas de estoque.

---

## 6. Relatórios e Exportação

Para fins de prestação de contas ou auditoria:
1. Vá ao menu **Relatórios**.
2. Selecione o tipo de relatório (Movimentações ou Estoque Atual).
3. Aplique filtros de data ou categoria se necessário.
4. Clique em **Exportar Excel (XLSX)** ou **CSV** para baixar o arquivo e abrir no Excel ou Google Sheets.

---

## 7. Perfis de Acesso

O que você pode fazer depende do seu perfil:
- **Administrador**: Acesso total, incluindo gestão de usuários e configurações do sistema.
- **Operador**: Pode cadastrar produtos e realizar movimentações, mas não exclui registros críticos ou gerencia outros usuários.
- **Consulta**: Pode apenas visualizar dados e gerar relatórios, sem permissão para alterar estoques.

---

## Dicas para uma boa gestão:
*   **Nunca deixe de registrar uma saída**: O estoque virtual deve ser o espelho exato do estoque físico.
*   **Revise os Estoques Mínimos**: Se um produto acaba com frequência, aumente o valor do estoque mínimo para ser avisado mais cedo.
*   **Use as Observações**: Nas movimentações, sempre escreva o motivo (ex: "Consumo para evento X" ou "Reposição mensal").
