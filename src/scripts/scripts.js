// Lista para armazernar as informações básicas dos pokemons. Nome e URL
let listaPokemon = [];

// consumo da API trazendo os 20 primeiros elementos
fetch("https://pokeapi.co/api/v2/pokemon?limit=20")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    listaPokemon = data.results;
    console.log("Lista básica dos primeiros 20 pokemons", listaPokemon);

    // Uma lista para pegar as informações mais detalhadas dos pokemons
    const promessasDeDetalhes = data.results.map((pokemonSimples) => {
      return fetch(pokemonSimples.url).then((res) => res.json());
    });

    // 2. Esperamos todas as 20 buscas individuais terminarem
    Promise.all(promessasDeDetalhes).then((pokemonsCompletos) => {
      listaPokemon = pokemonsCompletos;
      console.log("Lista detalhada pronta:", listaPokemon);

      // chamando a função para renderizar os cards de forma dinamica
      renderizarCards(listaPokemon);
    });
  })
  .catch((error) => console.error("Erro na requisição:", error));

//   função para renderizar os cards de forma dinamica
function renderizarCards(lista) {
  // "armazenando" o container onde ficam os cards em uma variavel
  const container = document.querySelector(".pokemon-card-content");

  const cardsHtml = lista
    .map((pokemon) => {
      // Criando o HTML dos tipos dinamicamente
      const tiposPokemon = pokemon.types
        .map((tipoInfo) => {
          return `<span>${tipoInfo.type.name}</span>`;
        })
        .join("");

      // montagem dos cards
      return `
      <article class="pokemon-card" onclick="abrirModal(${pokemon.id})">
        <section class="pokemon-name-container">
          
          <h2 class="pokemon-name">${pokemon.name}</h2>
          <div class="pokemon-id">#${pokemon.id}</div>
          
          <div class="pokemon-type">
            ${tiposPokemon}
          </div>
        </section>

        <section class="pokemon-image-container">
          <img src="${pokemon.sprites.other["official-artwork"].front_default}" 
               alt="${pokemon.name}" 
               class="pokemon-img" />
        </section>

        <section class="pokemon-footer-container">
          <span>#${String(pokemon.id).padStart(3, "0")}</span>
          <button type="button" class="favorite-pokemon-btn">
            <img src="./src/assets/icons/heart.svg" alt="Icone de coração" class="heart-icon-pokemon" />
          </button>
        </section>
      </article>
    `;
    })
    .join("");
  // Removendo os espaços entre os elementos com o join()

  container.innerHTML = cardsHtml;
}

const inputPokemon = document.getElementById("pokemonInput");

inputPokemon.addEventListener("input", () => {
  buscarPokemonNaApi();
});

async function buscarPokemonNaApi() {
  const busca = document
    .getElementById("pokemonInput")
    .value.toLowerCase()
    .trim();
  const container = document.querySelector(".pokemon-card-content");

  if (!busca) {
    // Se o input estiver vazio, volta a exibir a lista inicial de 20
    renderizarCards(listaPokemon);
    return;
  }

  try {
    // Faz a chamada direta para o Pokémon específico
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${busca}`);

    if (!response.ok) throw new Error("Pokémon não encontrado");

    const pokemonSoli = await response.json();

    const jaExiste = listaPokemon.find((p) => p.id === pokemonSoli.id);
    if (!jaExiste) {
      listaPokemon.push(pokemonSoli);
    }

    // Como a função renderizarCards espera um ARRAY, passamos o resultado dentro de []
    renderizarCards([pokemonSoli]);
  } catch (error) {
    container.innerHTML = `<p class="erro-busca">Ops! O Pokémon "${busca}" não foi encontrado.</p>`;
  }
}

let offset = 0;
const limit = 20;
let totalPokemons = 0; // Armazenará o total vindo da API

// Seletores baseados no seu HTML
const btnPrev = document.querySelector(".previous-btn");
const btnNext = document.querySelector(".next-btn");
const pageIndicator = document.querySelector(".page-identification-container");

async function buscarPokemons(novoOffset) {
  offset = novoOffset;
  const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    totalPokemons = data.count; // Total de pokémons na API (atualmente ~1302)

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

function atualizarInterfaceNavegacao() {
  const paginaAtual = offset / limit + 1;
  const totalPaginas = Math.ceil(totalPokemons / limit);

  // Atualiza o texto "Página X de N"
  if (pageIndicator) {
    pageIndicator.innerText = `Página ${paginaAtual} de ${totalPaginas}`;
  }

  // Desativa/Ativa os botões
  btnPrev.disabled = offset === 0;
  // Evita avançar além do total disponível
  btnNext.disabled = offset + limit >= totalPokemons;

  // Opcional: Adiciona uma classe visual de desativado se o seu CSS permitir
  btnPrev.style.opacity = btnPrev.disabled ? "0.5" : "1";
  btnNext.style.opacity = btnNext.disabled ? "0.5" : "1";
}

// Eventos de Clique
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
// Inicialização
buscarPokemons(0);

const btnHome = document.getElementById("btn-home");

if (btnHome) {
  btnHome.addEventListener("click", () => {
    buscarPokemons(0);

    window.scrollTo({ top: 0, behavior: "smooth" });

    console.log("Voltando para a primeira página...");
  });
}

function abrirModal(id) {
  const pokemon = listaPokemon.find((p) => p.id === id);
  if (!pokemon) return;

  // Tradução de tipos para cores das barras (pode usar suas variáveis do root)
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

  // Preenchendo dados básicos
  document.getElementById("modal-img").src =
    pokemon.sprites.other["official-artwork"].front_default;
  document.getElementById("modal-name").innerText = pokemon.name;
  document.getElementById("modal-id").innerText =
    `#${String(pokemon.id).padStart(4, "0")}`;
  document.getElementById("modal-height").innerText =
    `${pokemon.height / 10} M`;
  document.getElementById("modal-weight").innerText =
    `${pokemon.weight / 10} Kg`;

  // Habilidades
  document.getElementById("modal-abilities").innerHTML = pokemon.abilities
    .map((a) => `<span class="ability-tag">${a.ability.name}</span>`)
    .join("");

  // Estatísticas (Barras)
  const statsContainer = document.getElementById("modal-stats");
  const nomesStats = {
    hp: "HP",
    attack: "Ataque",
    defense: "Defesa",
    "special-attack": "Sp. Atk",
    "special-defense": "Sp. Def",
    speed: "Velocidade",
  };

  statsContainer.innerHTML = pokemon.stats
    .map((s) => {
      const porc = (s.base_stat / 200) * 100; // Normalizado para 200 como máximo
      return `
            <div class="stat-row">
                <span class="stat-name">${nomesStats[s.stat.name] || s.stat.name}</span>
                <div class="stat-bar-bg">
                    <div class="stat-bar-fill" style="width: ${porc}%; background-color: ${corPrincipal}"></div>
                </div>
                <span class="stat-number">${s.base_stat}</span>
            </div>
        `;
    })
    .join("");

  document.getElementById("pokemon-modal").style.display = "flex";
}

// Fechamento
document.getElementById("close-modal").onclick = () => {
  document.getElementById("pokemon-modal").style.display = "none";
};
// Função para fechar o modal (adicione esta também!)
function fecharModal() {
  const modal = document.getElementById("pokemon-modal");
  modal.style.display = "none";
}

function obterCorTipo(tipo) {
  // Pega o valor da variável CSS definida no :root
  const cor = getComputedStyle(document.documentElement)
    .getPropertyValue(`--${tipo}`)
    .trim();
  return cor || "#777"; // Retorna cinza caso o tipo não exista no CSS
}
