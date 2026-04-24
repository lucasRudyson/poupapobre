# Documento de Casos de Uso — PoupaPobre

## 1. Atores

*   **Usuário:** Pessoa física que utiliza o aplicativo para organizar e controlar suas finanças pessoais (orçamento, rendas e despesas).
*   **Sistema:** O próprio aplicativo PoupaPobre, responsável por cálculos (como o saldo e progresso da meta) e alertas automáticos.

---

## 2. Diagrama de Casos de Uso

![Diagrama de Casos de Uso — Visão Geral](./imagens/caso-de-uso.png)


Abaixo apresentamos a tabela de resumo dos casos de uso, identificando qual ator inicia a ação (Principal) e qual ator responde ou sofre o efeito (Secundário).

| ID | Nome do Caso de Uso | Ator Principal | Ator Secundário | Descrição Resumida |
| :--- | :--- | :--- | :--- | :--- |
| **CDU01** | Realizar Cadastro | Usuário | Sistema | Criar conta no aplicativo informando dados básicos. |
| **CDU02** | Realizar Login | Usuário | Sistema | Autenticação para acesso via E-mail e senha, Google ou Biometria. |
| **CDU03** | Gerenciar Renda Mensal | Usuário | Sistema | Registrar, editar ou excluir o valor da renda do mês vigente. |
| **CDU04** | Gerenciar Contas Fixas | Usuário | Sistema | Controlar despesas recorrentes e confirmar pagamento. |
| **CDU05** | Gerenciar Contas Variáveis | Usuário | Sistema | Controlar e categorizar despesas esporádicas. |
| **CDU06** | Gerenciar Meta de Economia | Usuário | Sistema | Definir valor-alvo mensal e visualizar status. |
| **CDU07** | Visualizar Dashboard e Gráficos | Usuário | Sistema | Consultar interface de resumos financeiros e relatórios. |
| **CDU08** | Consultar Histórico | Usuário | - | Acessar registros financeiros de meses anteriores. |
| **CDU09** | Emitir Alertas Financeiros | Sistema | Usuário | Disparar notificações ao se aproximar do limite do orçamento. |

---

## 3. Especificação Detalhada (Início)

Abaixo iniciamos a especificação dos Casos de Uso estruturais.

### CDU01: Realizar Cadastro
*   **Ator Principal:** Usuário
*   **Requisitos associados:** RF01
*   **Descrição:** Permite que um novo usuário crie uma conta no aplicativo.
*   **Pré-condições:** O usuário ter baixado o app e não estar logado.
*   **Fluxo Principal:**
    1.  O usuário abre o aplicativo e seleciona a opção "Criar Conta".
    2.  O sistema exibe o formulário solicitando: Nome, E-mail, Senha e Confirmação de Senha.
    3.  O usuário preenche os dados e confirma a ação.
    4.  O sistema valida as informações (formato de e-mail válido, senhas iguais).
    5.  O sistema registra o usuário, criptografa a senha e exibe mensagem de sucesso.
    6.  O usuário é redirecionado para a tela de Login ou diretamente para a Home.
*   **Fluxos de Exceção:**
    *   *FE01 - E-mail já cadastrado:* No passo 4, se o e-mail já existir, o sistema exibe alerta e sugere a recuperação de senha ou login.
    *   *FE02 - Senhas divergentes:* No passo 4, se as senhas não forem iguais, o sistema destaca os campos e pede correção.

### CDU02: Realizar Login
*   **Ator Principal:** Usuário
*   **Requisitos associados:** RF02, RF03, RF04, RN05
*   **Descrição:** Permite ao usuário acessar sua conta de forma segura.
*   **Pré-condições:** O usuário deve possuir um cadastro prévio (ou conta Google válida).
*   **Fluxo Principal (Login Tradicional):**
    1.  O usuário informa E-mail e Senha na tela inicial.
    2.  O usuário clica em "Entrar".
    3.  O sistema valida as credenciais.
    4.  O sistema concede acesso e exibe a tela principal (Home).
*   **Fluxos Alternativos:**
    *   *FA01 - Login com Google:* No passo 1, o usuário clica em "Entrar com Google". O sistema invoca a API do Google, valida o token e loga o usuário.
    *   *FA02 - Login Biométrico:* Após o primeiro acesso bem-sucedido (RN05), ao reabrir o app, o sistema solicita a digital/Face ID via API nativa (RNF02) e loga o usuário automaticamente.
*   **Fluxos de Exceção:**
    *   *FE01 - Credenciais inválidas:* No passo 3 do fluxo principal, se o e-mail ou senha estiverem incorretos, o sistema exibe "Usuário ou senha inválidos".
### CDU03: Gerenciar Renda Mensal
*   **Ator Principal:** Usuário
*   **Requisitos associados:** RF05, RF15, RN01
*   **Descrição:** Permite definir o valor total recebido no mês para basear os cálculos de saldo.
*   **Fluxo Principal:**
    1.  O usuário acessa a tela de Renda.
    2.  O sistema exibe o valor atual (se houver).
    3.  O usuário insere ou edita o valor da renda e salva.
    4.  O sistema atualiza o Saldo Disponível instantaneamente (RN01).
### CDU04: Gerenciar Contas Fixas
*   **Ator Principal:** Usuário
*   **Requisitos associados:** RF06, RF15, RF16, RN02
*   **Descrição:** Permite cadastrar, editar, excluir e marcar como pagas as despesas recorrentes (ex: aluguel, internet).
*   **Pré-condições:** O usuário deve estar logado no sistema.
*   **Fluxo Principal (Inclusão):**
    1.  O usuário acessa a área de Despesas Fixas e clica em "Adicionar Nova".
    2.  O sistema exibe formulário pedindo: Nome, Valor, Vencimento e Descrição.
    3.  O usuário preenche os dados e salva.
    4.  O sistema registra a conta com status "Pendente" (RN02) e atualiza o Saldo Disponível (RF08).
*   **Fluxos Alternativos:**
    *   *FA01 - Marcar como Paga:* Na lista de contas fixas, o usuário clica no ícone de confirmação de uma conta pendente. O sistema atualiza o status para "Paga".
    *   *FA02 - Edição/Exclusão:* O usuário desliza o item na lista e escolhe Editar ou Excluir. O sistema aplica a mudança e recalcula o saldo geral.



### CDU05: Gerenciar Contas Variáveis
*   **Ator Principal:** Usuário
*   **Requisitos associados:** RF07, RF12, RF15
*   **Descrição:** Registro de gastos ocasionais (ex: restaurante, farmácia).
*   **Fluxo Principal:**
    1.  O usuário clica no botão rápido de "Nova Despesa" (+).
    2.  O usuário insere Nome, Valor e seleciona uma Categoria (RF12).
    3.  O usuário confirma o cadastro.
    4.  O sistema abate o valor do saldo e registra a data atual.

### CDU06: Gerenciar Meta de Economia
*   **Ator Principal:** Usuário
*   **Requisitos associados:** RF09, RF10, RN03, RN06
*   **Descrição:** Permite ao usuário planejar o quanto quer poupar no mês.
*   **Fluxo Principal:**
    1.  O usuário acessa a área de Metas e clica em "Definir Meta".
    2.  O usuário insere o valor que deseja economizar.
    3.  O sistema aplica a **RN06**: calcula automaticamente quantos % esse valor representa em relação ao saldo atual.
    4.  O sistema valida se o valor é menor que a renda total (RN03).
    5.  O usuário confirma e o sistema passa a exibir a barra de progresso (RF10).

### CDU07: Visualizar Dashboard e Gráficos
*   **Ator Principal:** Usuário
*   **Requisitos associados:** RF08, RF10, RF13
*   **Descrição:** Visão centralizada da saúde financeira.
*   **Fluxo Principal:**
    1.  Ao abrir o app ou clicar em "Início", o sistema exibe o Saldo Atual (RF08) em destaque.
    2.  O sistema apresenta um gráfico de pizza mostrando a porcentagem de gastos por categoria (RF13).
    3.  O sistema exibe o status atual da meta de economia.

### CDU08: Consultar Histórico
*   **Ator Principal:** Usuário
*   **Requisitos associados:** RF14, RN04
*   **Descrição:** Acesso a dados de meses e anos passados.
*   **Fluxo Principal:**
    1.  O usuário acessa a tela de Histórico.
    2.  O usuário seleciona o Mês e o Ano desejados.
    3.  O sistema busca os registros no SQLite e exibe o resumo (Renda total, Gastos totais e Saldo final) daquele período.

### CDU09: Emitir Alertas Financeiros
*   **Ator Principal:** Sistema
*   **Ator Secundário:** Usuário
*   **Requisitos associados:** RF11
*   **Descrição:** O sistema avisa o usuário sobre riscos no orçamento.
*   **Fluxo Principal:**
    1.  O sistema monitora cada novo gasto inserido.
    2.  O sistema detecta que o somatório de despesas atingiu 80% (ou outro limite definido) da renda.
    3.  O sistema dispara uma notificação push para o dispositivo do usuário com um alerta de "Limite Próximo".
