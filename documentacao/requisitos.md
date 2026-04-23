# Documento de Requisitos — PoupaPobre

## Informações Gerais

| Campo             | Detalhe                        |
|-------------------|-------------------------------|
| **Nome do Sistema** | PoupaPobre             |
| **Plataforma**    | Mobile — React Native (Expo)  |
| **Tipo de Uso**   | Pessoal (usuário único)       |
| **Versão**        | 1.0                           |
| **Data**          | Abril de 2026                 |

---

## 1. Introdução

O **PoupaPobre** é um aplicativo mobile de gestão financeira pessoal.
O sistema permite ao usuário registrar sua renda, controlar despesas fixas e variáveis, definir metas de economia e acompanhar sua saúde financeira por meio de relatórios e gráficos, auxiliando na tomada de decisões e no desenvolvimento do hábito de economizar.

---

## 2. Escopo

O sistema contempla as seguintes macrofuncionalidades:

- Autenticação de usuário (cadastro, login por e-mail, Gmail e biometria)
- Registro e gestão de renda mensal
- Registro e gestão de contas fixas e variáveis
- Definição e acompanhamento de metas de economia
- Relatórios e gráficos financeiros
- Histórico de meses anteriores
- Notificações e alertas financeiros

---

## 3. Requisitos Funcionais

> Descrevem **o que o sistema deve fazer**.

| ID    | Descrição                                                                 | Prioridade |
|-------|---------------------------------------------------------------------------|------------|
| RF01  | O usuário deve poder se **cadastrar** com nome, e-mail e senha            | Alta       |
| RF02  | O usuário deve poder realizar **login com e-mail e senha**                | Alta       |
| RF03  | O usuário deve poder realizar **login com conta Google** (Gmail/OAuth)    | Alta       |
| RF04  | O usuário deve poder realizar **login com biometria** (digital)           | Alta       |
| RF05  | O usuário deve poder **cadastrar sua renda mensal** (salário)             | Alta       |
| RF06  | O usuário deve poder **cadastrar contas fixas** com nome, valor, data de vencimento e descrição opcional (ex: aluguel, plano de saúde) | Alta       |
| RF07  | O usuário deve poder **cadastrar contas variáveis** com nome, valor e data (ex: mercado, lazer, transporte)                            | Alta       |
| RF08  | O sistema deve **calcular automaticamente** o saldo disponível após deduzir todas as despesas da renda cadastrada                       |     Alta       |
| RF09  | O usuário deve poder **definir uma meta de economia** mensal com valor-alvo e prazo                                                   | Alta       |
| RF10  | O sistema deve **exibir o progresso** da meta de economia                | Alta       |
| RF11  | O sistema deve **alertar o usuário** quando os gastos se aproximarem do limite do orçamento definido                              | Média      |
| RF12  | O usuário deve poder **categorizar** suas despesas (ex: alimentação, moradia, saúde, lazer)                                | Média      |
| RF13  | O sistema deve exibir **relatórios e gráficos** de gastos por categoria  | Média      |
| RF14  | O sistema deve manter **histórico financeiro de meses anteriores**       | Média      |
| RF15  | O usuário deve poder **editar e excluir** qualquer lançamento registrado | Alta       |
| RF16  | O usuário deve poder **marcar contas fixas como pagas**                  | Alta       |

---

## 4. Requisitos Não Funcionais

> Descrevem **como o sistema deve se comportar**.

| ID     | Descrição                                                                 | Categoria      |
|--------|---------------------------------------------------------------------------|----------------|
| RNF01  | O app deve ser compatível com **Android**                           | Portabilidade  |
| RNF02  | O login biométrico deve utilizar a **API nativa do dispositivo**          | Segurança      |
| RNF03  | As senhas devem ser **armazenadas com criptografia** (hash)               | Segurança      |
| RNF04  | Os dados financeiros devem ser **armazenados localmente (SQLite) e criptografados** para garantir privacidade e proteção | Segurança      |
| RNF05  | O app deve ter **tempo de resposta inferior a 2 segundos** nas operações principais | Performance    |
| RNF06  | A interface deve ser **responsiva e acessível**, permitindo o cadastro de gastos em até 3 cliques da home | Usabilidade    |
| RNF07  | O app deve permitir **consulta offline** dos dados já carregados          | Disponibilidade|
| RNF08  | O sistema deve ser desenvolvido com **React Native, Expo e SQLite**       | Tecnologia     |

---

## 5. Regras de Negócio

| ID    | Regra                                                                               |
|-------|-------------------------------------------------------------------------------------|
| RN01  | O saldo disponível é calculado como: `Renda - (Σ Contas Fixas + Σ Contas Variáveis)` |
| RN02  | Uma conta fixa não paga no mês vigente deve permanecer como **pendente**            |
| RN03  | A meta de economia não pode ser maior que a renda mensal cadastrada                 |
| RN04  | O histórico deve ser agrupado e consultado **por mês e ano**                        |
| RN05  | O login biométrico só pode ser ativado após o primeiro login com e-mail ou Gmail    |

---

## 6. Restrições

- O sistema, em sua versão inicial, é destinado a **uso individual** (um único usuário por instalação)
- Não há suporte a múltiplas moedas nesta versão
- O app não realiza integração com bancos ou APIs financeiras externas nesta versão

---

## 7. Histórico de Revisões

| Versão | Data       | Descrição               | Autor        |
|--------|------------|-------------------------|--------------|
| 1.0    | Abril/2026 | Criação do documento    | Equipe       |