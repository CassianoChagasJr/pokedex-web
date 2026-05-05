// --- VARIÁVEIS GLOBAIS E ESTADO ---
// Armazena a lista detalhada de Pokémons exibidos na tela no momento
let listaPokemon = [];
// Recupera os favoritos salvos no navegador ou inicia um array vazio se não houver nada
let favoritos = JSON.parse(localStorage.getItem("pokedex-favoritos")) || [];
// Controla se o usuário está visualizando a lista geral ou apenas os favoritos
let exibindoFavoritos = false;
// Controla o ponto de partida da busca na API (ex: 0 para começar do Pokémon #1)
let offset = 0;
// Define quantos Pokémons serão carregados por vez (paginação)
const limit = 20;
// Armazena o número total de Pokémons existentes na PokeAPI
let totalPokemons = 0;

// --- SELETORES (Referência aos elementos do HTML) ---
const btnPrev = document.querySelector(".previous-btn"); // Botão "Anterior"
const btnNext = document.querySelector(".next-btn"); // Botão "Próximo"
const pageIndicator = document.querySelector(".page-identification-container"); // Texto da página atual
const btnGlobalFavoritos = document.querySelector(".favorite-button"); // Botão de filtro de favoritos
const inputPokemon = document.getElementById("pokemonInput"); // Campo de busca de texto
const btnHome = document.getElementById("btn-home"); // Título/Logo que volta ao início

// --- BUSCA E API (Comunicação com o servidor) ---

// Função assíncrona para buscar a lista de Pokémons baseada no offset
async function buscarPokemons(novoOffset) {
  offset = novoOffset; // Atualiza o offset global
  const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`; // Monta a URL da API

  try {
    const response = await fetch(url); // Faz a requisição inicial
    const data = await response.json(); // Converte a resposta para JSON
    totalPokemons = data.count; // Guarda o total de Pokémons disponíveis

    // Mapeia a lista básica para criar promessas de busca dos detalhes de cada Pokémon
    const promises = data.results.map((pokemon) =>
      fetch(pokemon.url).then((res) => res.json()),
    );
    // Aguarda todas as buscas detalhadas serem finalizadas
    const detalhesPokemons = await Promise.all(promises);

    listaPokemon = detalhesPokemons; // Atualiza a lista global com dados completos
    renderizarCards(listaPokemon); // Chama a função para desenhar os cards na tela
    atualizarInterfaceNavegacao(); // Atualiza os botões de página
  } catch (error) {
    console.error("Erro ao buscar Pokémon:", error); // Exibe erro no console se algo falhar
  }
}

// Função para buscar um Pokémon específico digitado no input
async function buscarPokemonNaApi() {
  const busca = inputPokemon.value.toLowerCase().trim(); // Normaliza o texto digitado
  const container = document.querySelector(".pokemon-card-content"); // Container dos cards

  if (!busca) {
    renderizarCards(listaPokemon); // Se apagar o texto, volta a mostrar a lista atual
    return;
  }

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${busca}`); // Busca o nome/ID exato
    if (!response.ok) throw new Error("Pokémon não encontrado"); // Lança erro se a API não achar

    const pokemonSoli = await response.json(); // Converte dados do Pokémon encontrado
    renderizarCards([pokemonSoli]); // Renderiza apenas o Pokémon buscado (em formato de array)
  } catch (error) {
    // Exibe mensagem de erro caso o Pokémon não exista
    container.innerHTML = `<p class="erro-busca">Ops! O Pokémon "${busca}" não foi encontrado.</p>`;
  }
}

// --- RENDERIZAÇÃO (Criação do HTML dinâmico) ---
function renderizarCards(lista) {
  const container = document.querySelector(".pokemon-card-content"); // Local onde os cards aparecerão
  if (!container) return; // Segurança caso o container não exista

  container.innerHTML = lista
    .map((pokemon) => {
      const isFavorite = favoritos.includes(pokemon.id); // Checa se o Pokémon atual é favorito
      // Define qual ícone de coração usar (vazio ou preenchido)
      const heartIcon = isFavorite
        ? "./src/assets/icons/heartComplete.svg"
        : "./src/assets/icons/heart.svg";

      // Cria as tags de tipos (Fire, Water, etc.)
      const tiposPokemon = pokemon.types
        .map((tipoInfo) => `<span>${tipoInfo.type.name}</span>`)
        .join("");

      // Retorna a estrutura HTML do card para o map
      return `
      <article class="pokemon-card" onclick="abrirModal(${pokemon.id})">
        <section class="pokemon-name-container">
          <h2 class="pokemon-name">${pokemon.name}</h2>
          <div class="pokemon-id">#${pokemon.id}</div>
          <div class="pokemon-type">${tiposPokemon}</div>
        </section>

        <section class="pokemon-image-container">
          <img src="${pokemon.sprites.other["official-artwork"].front_default}" 
               alt="${pokemon.name}" class="pokemon-img" />
        </section>

        <section class="pokemon-footer-container">
          <span>#${String(pokemon.id).padStart(3, "0")}</span>
          <button type="button" 
                  class="favorite-pokemon-btn ${isFavorite ? "active" : ""}" 
                  onclick="event.stopPropagation(); toggleFavorito(${pokemon.id})">
            <img src="${heartIcon}" alt="Icone de coração" class="heart-icon-pokemon" />
          </button>
        </section>
      </article>
    `;
    })
    .join(""); // Une todos os cards em uma única string HTML
}

// --- FAVORITOS (Lógica de salvamento) ---
// Adiciona ou remove um ID da lista de favoritos
function toggleFavorito(pokemonId) {
  const index = favoritos.indexOf(pokemonId); // Procura se o ID já existe na lista

  if (index === -1) {
    favoritos.push(pokemonId); // Se não existe, adiciona
  } else {
    favoritos.splice(index, 1); // Se existe, remove
  }

  localStorage.setItem("pokedex-favoritos", JSON.stringify(favoritos)); // Atualiza o banco de dados do navegador

  // Atualiza a tela conforme a aba que o usuário está
  if (exibindoFavoritos) {
    exibirApenasFavoritos();
  } else {
    renderizarCards(listaPokemon);
  }
}

// Função para buscar e mostrar apenas os Pokémons marcados como favoritos
async function exibirApenasFavoritos() {
  const container = document.querySelector(".pokemon-card-content");
  const nav = document.querySelector(".page-navigation");

  if (favoritos.length === 0) {
    container.innerHTML =
      "<p class='erro-busca'>Nenhum Pokémon favoritado ainda.</p>";
    if (nav) nav.style.display = "none"; // Esconde paginação se estiver vazio
    return;
  }

  try {
    if (nav) nav.style.display = "none"; // Esconde a paginação ao ver favoritos

    // Busca os dados detalhados de cada ID favorito simultaneamente
    const promises = favoritos.map((id) =>
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) =>
        res.json(),
      ),
    );
    const pokemonsFavoritos = await Promise.all(promises);
    renderizarCards(pokemonsFavoritos); // Exibe os favoritos
  } catch (error) {
    console.error("Erro ao carregar favoritos:", error);
  }
}

// --- NAVEGAÇÃO E INTERFACE (Paginação) ---
function atualizarInterfaceNavegacao() {
  const paginaAtual = offset / limit + 1; // Cálculo da página atual
  const totalPaginas = Math.ceil(totalPokemons / limit); // Cálculo do total de páginas

  if (pageIndicator) {
    pageIndicator.innerText = `Página ${paginaAtual} de ${totalPaginas}`; // Atualiza o texto na tela
  }

  btnPrev.disabled = offset === 0; // Desativa "Anterior" se estiver na primeira página
  btnNext.disabled = offset + limit >= totalPokemons; // Desativa "Próximo" se chegar no fim

  // Feedback visual de botões desativados
  btnPrev.style.opacity = btnPrev.disabled ? "0.5" : "1";
  btnNext.style.opacity = btnNext.disabled ? "0.5" : "1";
}

// --- EVENTOS (Interações do usuário) ---

inputPokemon.addEventListener("input", buscarPokemonNaApi); // Busca enquanto o usuário digita
// Botão para avançar a próxima página
btnNext.addEventListener("click", () => {
  if (offset + limit < totalPokemons) {
    buscarPokemons(offset + limit); // Avança o offset[cite: 2]
    window.scrollTo({ top: 0, behavior: "smooth" }); // Volta ao topo suavemente
  }
});

// Botão para voltar a página anterior
btnPrev.addEventListener("click", () => {
  if (offset > 0) {
    buscarPokemons(offset - limit); // Recua o offset
    window.scrollTo({ top: 0, behavior: "smooth" }); // Volta ao topo suavemente
  }
});

// Evento para o botão Home
if (btnHome) {
  btnHome.addEventListener("click", () => {
    exibindoFavoritos = false; // Sai do modo favoritos
    const nav = document.querySelector(".page-navigation");
    if (nav) nav.style.display = "flex"; // Reativa a navegação
    if (btnGlobalFavoritos) {
      btnGlobalFavoritos.classList.remove("active"); // Reseta estilo do botão
      btnGlobalFavoritos.innerHTML = `<img src="./src/assets/icons/heartComplete.svg" alt="icone de favorito" class="heart-icon" /> Apenas Favoritos`;
    }
    buscarPokemons(0); // Volta para a página 1
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Evento para alternar entre Favoritos e Todos
if (btnGlobalFavoritos) {
  btnGlobalFavoritos.addEventListener("click", () => {
    exibindoFavoritos = !exibindoFavoritos; // Inverte o estado
    if (exibindoFavoritos) {
      btnGlobalFavoritos.classList.add("active");
      btnGlobalFavoritos.innerHTML = `<img src="./src/assets/icons/heartComplete.svg" alt="icone de favorito" class="heart-icon" /> Ver Todos`;
      exibirApenasFavoritos(); // Mostra favoritos
    } else {
      btnGlobalFavoritos.classList.remove("active");
      btnGlobalFavoritos.innerHTML = `<img src="./src/assets/icons/heart.svg" alt="icone de favorito" class="heart-icon" /> Apenas Favoritos`;
      const nav = document.querySelector(".page-navigation");
      if (nav) nav.style.display = "flex"; // Mostra navegação novamente
      buscarPokemons(offset); // Volta para a lista normal
    }
  });
}

// --- MODAL (Informações completas do Pokémon) ---

function abrirModal(id) {
  // Encontra os dados do Pokémon clicado na lista global
  const pokemon = listaPokemon.find((p) => p.id === id);
  if (!pokemon) return;

  // Mapa de cores para cada tipo de Pokémon
  const coresTipos = {
    fire: "#ee8130",
    water: "#6390f0",
    grass: "#7ac74c",
    electric: "#f7d02c",
    poison: "#a33ea1",
    flying: "#a98ff3",
    bug: "#a6b91a",
    normal: "#a8a77a",
  };
  // Define a cor base do modal baseada no primeiro tipo do Pokémon
  const corPrincipal = coresTipos[pokemon.types[0].type.name] || "#7f8c8d";

  // Preenche as informações básicas no Modal HTML
  document.getElementById("modal-img").src =
    pokemon.sprites.other["official-artwork"].front_default;
  document.getElementById("modal-name").innerText = pokemon.name;
  document.getElementById("modal-id").innerText =
    `#${String(pokemon.id).padStart(4, "0")}`;
  document.getElementById("modal-height").innerText =
    `${pokemon.height / 10} M`; // Converte decímetros para metros
  document.getElementById("modal-weight").innerText =
    `${pokemon.weight / 10} Kg`; // Converte hectogramas para quilos

  // Renderiza as habilidades
  document.getElementById("modal-abilities").innerHTML = pokemon.abilities
    .map((a) => `<span class="ability-tag">${a.ability.name}</span>`)
    .join("");

  // Nomes para as estatísticas
  const nomesStats = {
    hp: "HP",
    attack: "Ataque",
    defense: "Defesa",
    "special-attack": "Sp. Atk",
    "special-defense": "Sp. Def",
    speed: "Velocidade",
  };

  // Cria as barras de status dinâmicas
  document.getElementById("modal-stats").innerHTML = pokemon.stats
    .map((s) => {
      const porc = (s.base_stat / 200) * 100; // Calcula a largura da barra baseado no máximo de 200
      return `
      <div class="stat-row">
        <span class="stat-name">${nomesStats[s.stat.name] || s.stat.name}</span>
        <div class="stat-bar-bg">
          <div class="stat-bar-fill" style="width: ${porc}%; background-color: ${corPrincipal}"></div>
        </div>
        <span class="stat-number">${s.base_stat}</span>
      </div>`;
    })
    .join("");

  document.getElementById("pokemon-modal").style.display = "flex"; // Exibe o modal
}

// Fecha o modal ao clicar no botão de fechar (X)
document.getElementById("close-modal").onclick = () => {
  document.getElementById("pokemon-modal").style.display = "none";
};

// --- INICIALIZAÇÃO ---
buscarPokemons(0); // Dispara a primeira busca ao carregar a página
