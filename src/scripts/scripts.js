// --- VARIÁVEIS GLOBAIS E ESTADO ---
let listaPokemon = [];
let favoritos = JSON.parse(localStorage.getItem("pokedex-favoritos")) || [];
let exibindoFavoritos = false;
let offset = 0;
const limit = 20;
let totalPokemons = 0;

// --- SELETORES ---
const btnPrev = document.querySelector(".previous-btn");
const btnNext = document.querySelector(".next-btn");
const pageIndicator = document.querySelector(".page-identification-container");
const btnGlobalFavoritos = document.querySelector(".favorite-button"); // Seletor atualizado
const inputPokemon = document.getElementById("pokemonInput");
const btnHome = document.getElementById("btn-home");

// --- BUSCA E API ---

async function buscarPokemons(novoOffset) {
  offset = novoOffset;
  const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    totalPokemons = data.count;

    const promises = data.results.map((pokemon) =>
      fetch(pokemon.url).then((res) => res.json()),
    );
    const detalhesPokemons = await Promise.all(promises);

    listaPokemon = detalhesPokemons;
    renderizarCards(listaPokemon);
    atualizarInterfaceNavegacao();
  } catch (error) {
    console.error("Erro ao buscar Pokémon:", error);
  }
}

async function buscarPokemonNaApi() {
  const busca = inputPokemon.value.toLowerCase().trim();
  const container = document.querySelector(".pokemon-card-content");

  if (!busca) {
    renderizarCards(listaPokemon);
    return;
  }

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${busca}`);
    if (!response.ok) throw new Error("Pokémon não encontrado");

    const pokemonSoli = await response.json();
    renderizarCards([pokemonSoli]);
  } catch (error) {
    container.innerHTML = `<p class="erro-busca">Ops! O Pokémon "${busca}" não foi encontrado.</p>`;
  }
}

// --- RENDERIZAÇÃO ---

function renderizarCards(lista) {
  const container = document.querySelector(".pokemon-card-content");
  if (!container) return;

  container.innerHTML = lista
    .map((pokemon) => {
      const isFavorite = favoritos.includes(pokemon.id);
      // Troca dinâmica de ícone baseada no status de favorito[cite: 1]
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

function toggleFavorito(pokemonId) {
  const index = favoritos.indexOf(pokemonId);

  if (index === -1) {
    favoritos.push(pokemonId);
  } else {
    favoritos.splice(index, 1);
  }

  localStorage.setItem("pokedex-favoritos", JSON.stringify(favoritos));

  // Se estiver na tela de favoritos, atualiza a lista filtrada; caso contrário, atualiza a lista geral[cite: 1]
  if (exibindoFavoritos) {
    exibirApenasFavoritos();
  } else {
    renderizarCards(listaPokemon);
  }
}

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
    if (nav) nav.style.display = "none"; // Esconde paginação ao ver favoritos[cite: 1]

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

if (btnHome) {
  btnHome.addEventListener("click", () => {
    exibindoFavoritos = false;
    const nav = document.querySelector(".page-navigation");
    if (nav) nav.style.display = "flex";
    if (btnGlobalFavoritos) {
      btnGlobalFavoritos.classList.remove("active");
      btnGlobalFavoritos.innerHTML = `<img src="./src/assets/icons/heartComplete.svg" alt="icone de favorito" class="heart-icon" /> Apenas Favoritos`;
    }
    buscarPokemons(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

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

// --- MODAL ---

function abrirModal(id) {
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

document.getElementById("close-modal").onclick = () => {
  document.getElementById("pokemon-modal").style.display = "none";
};

// --- INICIALIZAÇÃO ---
buscarPokemons(0);
