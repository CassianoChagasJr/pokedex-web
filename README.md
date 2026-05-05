# 🚀 Pokédex Web - Vanilla JS

Uma aplicação interativa de Pokédex desenvolvida para a disciplina de Programação Web II do Instituto Federal de Pernambuco, campus Jaboatão dos Guararapes. O projeto consome a API pública **PokeAPI** para listar, pesquisar e detalhar as informações dos Pokémons em tempo real.

## 📋 Sobre o Projeto

Este projeto tem como objetivo consolidar conhecimentos em desenvolvimento Front-End utilizando tecnologias fundamentais da Web. Ele foi construído seguindo o paradigma de Single Page Application (SPA) simplificada, onde o conteúdo é gerado dinamicamente via JavaScript conforme a interação do usuário.

### 🛠 Tecnologias Utilizadas

- **HTML5**: Estruturação semântica da aplicação.
- **CSS3**: Estilização moderna, incluindo layouts responsivos e design de cartões.
- **JavaScript (ES6+)**: Lógica de consumo de API (Fetch/Async-Await), manipulação do DOM e gerenciamento de estado.
- **PokeAPI**: Fonte de dados externa para informações dos Pokémons.

---

## ✨ Funcionalidades Principais

- **Listagem Dinâmica**: Carregamento de Pokémons em lotes de 20 por página para otimização de performance.
- **Busca em Tempo Real**: Filtro de busca por nome ou ID que atualiza a interface instantaneamente.
- **Sistema de Favoritos**: Permite salvar Pokémons favoritos com persistência de dados utilizando o `localStorage` do navegador.
- **Modal de Detalhes**: Visualização expandida ao clicar em um card, exibindo altura, peso, habilidades e barras de estatísticas coloridas conforme o tipo do Pokémon.
- **Paginação**: Navegação fluida entre as diferentes páginas da Pokédex.

---

## 🚀 Como Executar o Projeto

Como este projeto utiliza apenas tecnologias nativas (Vanilla), não é necessário instalar dependências como Node.js.

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/seu-usuario/nome-do-repositorio.git](https://github.com/seu-usuario/nome-do-repositorio.git)
   ```

**Abra o arquivo principal:**

- Basta abrir o arquivo `index.html` em qualquer navegador moderno.
- _Dica_: Se estiver usando o VS Code, utilize a extensão **Live Server** para visualizar as alterações em tempo real.

---

## 📂 Estrutura de Arquivos

```text
├── src/
│   ├── assets/        # Ícones (coração, setas)
│   ├── styles/           # Arquivos de estilização (styles.css)
│   └── scripts/            # Lógica da aplicação (script.js)
├── index.html         # Estrutura principal
└── README.md          # Documentação do projeto
```

Projeto desenvolvido como parte dos estudos no curso de Análise e Desenvolvimento de Sistemas (Instituto Federal de Pernambuco, campus Jaboatão dos Guararapes). 

**Aluno:** Cassiano Do Espirito Santo Chagas Junior 

**Turma:** ADS 2025.2

**Professor:** Josino Neto

## Referências

## Ícones: **https://www.flaticon.com/search?word**
