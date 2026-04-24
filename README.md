# PoupaPobre

O **PoupaPobre** é um aplicativo mobile focado em gerenciamento financeiro pessoal simplificado e visualmente atraente. Desenvolvido para ajudar usuários a terem clareza sobre seus gastos mensais, categorizarem despesas (fixas e variáveis) e acompanharem metas de economia com facilidade.

**Projeto acadêmico para a disciplina de Programação Mobile.**

---

## O Projeto
Criado com uma estética focada em modernidade e fluidez, o app utiliza um **Design System** premium, inspirado na paleta *Dark Mode* ("The Luminous Vault"), com uso predominante de tons violeta, índigo e elementos de *Glassmorphism* (efeito de vidro translúcido).

---

## Tecnologias e Stack

Abaixo estão as principais tecnologias que escolhemos para tirar esse app do papel:
*   **React Native & Expo:** Para a construção das interfaces multiplataforma (iOS e Android) de forma ágil e moderna.
*   **TypeScript:** Garantindo tipagem forte e maior segurança no código.
*   **SQLite (Local):** Banco de dados embutido para garantir que as informações financeiras do usuário estejam sempre disponíveis offline e armazenadas localmente no próprio aparelho, priorizando a segurança.
*   **React Navigation / Expo Router:** Navegação em pilha e abas, garantindo fluidez entre telas.

---

## Principais Funcionalidades

O projeto se baseia nos Requisitos e Casos de Uso previamente estipulados:
1.  **Dashboard Visual:** Gráficos e cards que exibem o saldo atual e resumos mensais de forma clara.
2.  **Gerenciamento de Entradas e Saídas:** Cadastro facilitado de Rendimentos e Despesas (classificadas em Fixas ou Variáveis).
3.  **Controle de Metas de Economia:** Acompanhe a porcentagem dos seus ganhos que já foram comprometidos em metas.
4.  **Sistema de Notificações Locais:** Alertas caso você atinja o limite percentual do seu orçamento definido no mês.
5.  **Acesso com Biometria:** Autenticação usando TouchID/FaceID.

---

## Documentação

Toda a base teórica e de engenharia do app está organizada para facilitar a consulta. Você pode acessar o guia consolidado ou as seções específicas:

*   **[Documentação Completa Unificada](./documentacao/documentacao_completa.md)** - Guia geral com requisitos, casos de uso e diagramas em um único lugar.

### Documentações Específicas:
*   [Requisitos Funcionais e Regras de Negócio](./documentacao/requisitos.md)
*   [Casos de Uso e Fluxos Detalhados](./documentacao/casos_de_uso.md)
*   [Diagrama de Classes e Arquitetura de Dados](./documentacao/diagrama_de_classes.md)

---

## Como executar o projeto localmente

Como o projeto utiliza **Expo**, a execução no ambiente de desenvolvimento é bem simples.

**Pré-requisitos:** Ter o [Node.js](https://nodejs.org/) instalado em sua máquina e o app *Expo Go* no seu celular (ou simulador devidamente configurado).

1. Clone o repositório e acesse a pasta do projeto.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor do Expo:
   ```bash
   npx expo start
   ```
4. Escaneie o QR Code exibido no terminal utilizando o aplicativo do **Expo Go** (no celular) ou pressione `i` para abrir no emulador de iOS / `a` para Android.

---
Desenvolvido por Lucas e Juscelino.
