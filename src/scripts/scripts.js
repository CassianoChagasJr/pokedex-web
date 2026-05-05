// --- VARIÁVEIS GLOBAIS E ESTADO ---

// Armazena a lista detalhada de Pokémons exibidos ou carregados na sessão
let listaPokemon = [];
// Recupera os favoritos salvos no navegador ou inicia um array vazio
let favoritos = JSON.parse(localStorage.getItem("pokedex-favoritos")) || [];
// Controla se a visualização atual é de favoritos ou da lista geral
let exibindoFavoritos = false;
// Ponto de partida para a paginação da API
let offset = 0;
// Quantidade de Pokémons carregados por página
const limit = 20;
// Quantidade total de Pokémons que a API possui
let totalPokemons = 0;

// --- SELETORES (Elementos do HTML) ---

const btnPrev = document.querySelector(".previous-btn"); // Botão Voltar
const btnNext = document.querySelector(".next-btn"); // Botão Avançar
const pageIndicator = document.querySelector(".page-identification-container"); // Texto da página
const btnGlobalFavoritos = document.querySelector(".favorite-button"); // Botão "Apenas Favoritos"
const inputPokemon = document.getElementById("pokemonInput"); // Barra de pesquisa
const btnHome = document.getElementById("btn-home"); // Link para resetar a página

// --- BUSCA E API ---

// Função principal para carregar Pokémons da API
async function buscarPokemons(novoOffset) {
  offset = novoOffset;
  const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

  try {
    const response = await fetch(url); // Aguarda a resposta inicial da lista
    const data = await response.json(); // Converte para formato legível
    totalPokemons = data.count;

    // Cria uma lista de promessas para buscar os detalhes (fotos, status) de cada Pokémon
    const promises = data.results.map((pokemon) =>
      fetch(pokemon.url).then((res) => res.json()),
    );
    // Aguarda todas as requisições individuais terminarem
    const detalhesPokemons = await Promise.all(promises);

    listaPokemon = detalhesPokemons; // Salva os dados na lista global
    renderizarCards(listaPokemon); // Desenha os cards no HTML
    atualizarInterfaceNavegacao(); // Atualiza estado dos botões de página
  } catch (error) {
    console.error("Erro ao buscar Pokémon:", error);
  }
}

// Função para buscar Pokémon via Input de texto
async function buscarPokemonNaApi() {
  const busca = inputPokemon.value.toLowerCase().trim();
  const container = document.querySelector(".pokemon-card-content");

  if (!busca) {
    renderizarCards(listaPokemon); // Se vazio, volta para a lista carregada
    return;
  }

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${busca}`);
    if (!response.ok) throw new Error("Pokémon não encontrado");

    const pokemonSoli = await response.json();

    // --- CORREÇÃO DO MODAL ---
    // Verifica se o Pokémon buscado já está na lista global. Se não estiver, adiciona.
    // Isso garante que a função abrirModal() encontre os dados dele depois.
    const jaExiste = listaPokemon.find((p) => p.id === pokemonSoli.id);
    if (!jaExiste) {
      listaPokemon.push(pokemonSoli);
    }

    renderizarCards([pokemonSoli]); // Renderiza apenas o resultado da busca
  } catch (error) {
    container.innerHTML = `<p class="erro-busca">Ops! O Pokémon "${busca}" não foi encontrado.</p>`;
  }
}

// --- RENDERIZAÇÃO ---

// Transforma os objetos de dados em elementos visíveis na tela
function renderizarCards(lista) {
  const container = document.querySelector(".pokemon-card-content");
  if (!container) return;

  container.innerHTML = lista
    .map((pokemon) => {
      const isFavorite = favoritos.includes(pokemon.id);
      // Seleciona o ícone baseado no status de favorito
      const heartIcon = isFavorite
        ? "./src/assets/icons/heartComplete.svg"
        : "./src/assets/icons/heart.svg";

      const tiposPokemon = pokemon.types
        .map((tipoInfo) => `<span>${tipoInfo.type.name}</span>`)
        .join("");

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
    .join("");
}

// --- FAVORITOS ---

// Alterna entre favoritar e desfavoritar um Pokémon
function toggleFavorito(pokemonId) {
  const index = favoritos.indexOf(pokemonId);

  if (index === -1) {
    favoritos.push(pokemonId); // Adiciona se não estiver na lista
  } else {
    favoritos.splice(index, 1); // Remove se já estiver
  }

  localStorage.setItem("pokedex-favoritos", JSON.stringify(favoritos)); // Salva no navegador

  // Recarrega a visualização correta
  if (exibindoFavoritos) {
    exibirApenasFavoritos();
  } else {
    renderizarCards(listaPokemon);
  }
}

// Busca na API apenas os dados dos Pokémons favoritados
async function exibirApenasFavoritos() {
  const container = document.querySelector(".pokemon-card-content");
  const nav = document.querySelector(".page-navigation");

  if (favoritos.length === 0) {
    container.innerHTML =
      "<p class='erro-busca'>Nenhum Pokémon favoritado ainda.</p>";
    if (nav) nav.style.display = "none";
    return;
  }

  try {
    if (nav) nav.style.display = "none"; // Oculta paginação ao ver favoritos

    const promises = favoritos.map((id) =>
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) =>
        res.json(),
      ),
    );
    const pokemonsFavoritos = await Promise.all(promises);
    renderizarCards(pokemonsFavoritos);
  } catch (error) {
    console.error("Erro ao carregar favoritos:", error);
  }
}

// --- NAVEGAÇÃO E INTERFACE ---

function atualizarInterfaceNavegacao() {
  const paginaAtual = offset / limit + 1;
  const totalPaginas = Math.ceil(totalPokemons / limit);

  if (pageIndicator) {
    pageIndicator.innerText = `Página ${paginaAtual} de ${totalPaginas}`;
  }

  btnPrev.disabled = offset === 0;
  btnNext.disabled = offset + limit >= totalPokemons;
  btnPrev.style.opacity = btnPrev.disabled ? "0.5" : "1";
  btnNext.style.opacity = btnNext.disabled ? "0.5" : "1";
}

// --- EVENTOS ---

inputPokemon.addEventListener("input", buscarPokemonNaApi);

btnNext.addEventListener("click", () => {
  if (offset + limit < totalPokemons) {
    buscarPokemons(offset + limit);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

btnPrev.addEventListener("click", () => {
  if (offset > 0) {
    buscarPokemons(offset - limit);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

// Clique na Logo/Home reseta para a lista inicial
if (btnHome) {
  btnHome.addEventListener("click", () => {
    exibindoFavoritos = false;
    const nav = document.querySelector(".page-navigation");
    if (nav) nav.style.display = "flex";
    if (btnGlobalFavoritos) {
      btnGlobalFavoritos.classList.remove("active");
      btnGlobalFavoritos.innerHTML = `<img src="./src/assets/icons/heart.svg" alt="icone de favorito" class="heart-icon" /> Apenas Favoritos`;
    }
    buscarPokemons(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Alternar entre ver Todos ou ver Favoritos
if (btnGlobalFavoritos) {
  btnGlobalFavoritos.addEventListener("click", () => {
    exibindoFavoritos = !exibindoFavoritos;
    if (exibindoFavoritos) {
      btnGlobalFavoritos.classList.add("active");
      btnGlobalFavoritos.innerHTML = `<img src="./src/assets/icons/heartComplete.svg" alt="icone de favorito" class="heart-icon" /> Ver Todos`;
      exibirApenasFavoritos();
    } else {
      btnGlobalFavoritos.classList.remove("active");
      btnGlobalFavoritos.innerHTML = `<img src="./src/assets/icons/heart.svg" alt="icone de favorito" class="heart-icon" /> Apenas Favoritos`;
      const nav = document.querySelector(".page-navigation");
      if (nav) nav.style.display = "flex";
      buscarPokemons(offset);
    }
  });
}

// --- MODAL (Detalhes) ---

function abrirModal(id) {
  // Procura os dados do Pokémon pelo ID na lista carregada
  const pokemon = listaPokemon.find((p) => p.id === id);
  if (!pokemon) return;

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
  const corPrincipal = coresTipos[pokemon.types[0].type.name] || "#7f8c8d";

  // Preenche dados visuais do Modal
  document.getElementById("modal-img").src =
    pokemon.sprites.other["official-artwork"].front_default;
  document.getElementById("modal-name").innerText = pokemon.name;
  document.getElementById("modal-id").innerText =
    `#${String(pokemon.id).padStart(4, "0")}`;
  document.getElementById("modal-height").innerText =
    `${pokemon.height / 10} M`;
  document.getElementById("modal-weight").innerText =
    `${pokemon.weight / 10} Kg`;

  document.getElementById("modal-abilities").innerHTML = pokemon.abilities
    .map((a) => `<span class="ability-tag">${a.ability.name}</span>`)
    .join("");

  const nomesStats = {
    hp: "HP",
    attack: "Ataque",
    defense: "Defesa",
    "special-attack": "Sp. Atk",
    "special-defense": "Sp. Def",
    speed: "Velocidade",
  };

  // Cria barras de estatísticas baseadas nos valores da API
  document.getElementById("modal-stats").innerHTML = pokemon.stats
    .map((s) => {
      const porc = (s.base_stat / 200) * 100;
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

  document.getElementById("pokemon-modal").style.display = "flex";
}

// Fecha o modal
document.getElementById("close-modal").onclick = () => {
  document.getElementById("pokemon-modal").style.display = "none";
};

// --- INICIALIZAÇÃO ---
buscarPokemons(0); // Carrega os primeiros 20 Pokémons
