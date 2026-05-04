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

  container.innerHTML = cardsHtml;
}
