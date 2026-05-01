# Regras do Agente: Poupe Pobre

## Pilha Técnica
- **Framework:** React Native com Expo (Template Blank)
- **Navegação:** Expo Router
- **Estilização:** NativeWind (Tailwind CSS para React Native)
- **Banco de Dados Local:** SQLite
- **Gerenciamento de Estado:** Zustand

## Padrões de Codificação
- Use estritamente **TypeScript** para todo o código. Evite `any`.
- Utilize componentes funcionais do React.
- Mantenha a nomenclatura de variáveis, funções e componentes clara, em inglês ou português (manter a consistência que o desenvolvedor iniciar).

## Princípios de Arquitetura
- **Modularidade (DRY):** Mantenha arquivos e componentes pequenos e focados em uma única responsabilidade. Se um trecho de UI ou lógica se repetir, abstraia para um componente ou hook reutilizável.
- **Separação de Preocupações:** Separe claramente as regras de negócio (hooks, Zustand) da interface visual (componentes).

## Instruções de Comportamento para a IA
1. **Checklist de Progresso:** Para toda nova funcionalidade ou tarefa, crie um checklist para sabermos o que está sendo feito e o que falta.
2. **Log de Conclusão de Branch:** Ao final de cada funcionalidade/branch, gere um relatório de log curto resumindo quais itens do checklist foram concluídos para facilitar a documentação e commits do Git.
3. **Explique o Porquê:** Sempre explique conceitos novos ou decisões arquitetônicas antes de fornecer o código. 
4. **Caminho Feliz Primeiro:** Foque na solução mais simples que funcione primeiro, depois iteramos para adicionar tratamento de erros complexos.
5. **Sem Código Surpresa:** Não altere arquivos ou configurações que não foram solicitados pelo arquiteto (desenvolvedor).