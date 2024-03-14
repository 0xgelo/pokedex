$(document).ready(async function () {
    // Show loading spinner
    $('#loading-spinner').show();
    var offset = 0;
    var pokeCount = 0;

    async function fetchPokemonData(offset) {
        var pokeEndpoint = `https://pokeapi.co/api/v2/pokemon/?limit=20&offset=${offset}`;
        var result = await getPokemonAll(pokeEndpoint);
        pokeCount = Math.ceil(result.count / 20); 
        const pokemonDataArray = await Promise.all(result.results.map(async function (pokemon) {
            const pokemonData = await getPokemon(pokemon.name.toLowerCase());
            const pokemonDesc = await getPokemonDesc(pokemonData.name);
            const desc = pokemonDesc.flavor_text_entries[0];
            const engDesc = desc.language.name === "en" ? desc.flavor_text : pokemonDesc.flavor_text_entries[0 + 1].flavor_text;
            return {
                id: pokemonData.id,
                name: pokemonData.name,
                img: pokemonData.sprites.other['official-artwork'].front_default,
                description: engDesc.split('\n').join(' ').replace(/\f/g, ' ')
            };
        }));
        renderPokemonCards(pokemonDataArray);
    }


    fetchPokemonData(offset);
    $('#loading-spinner').hide(); 


    $('#next').click(async function () {
        offset += 20; 
        if (offset < pokeCount * 20) { 
            $('#card-container').empty(); 
            $('#page_btn').text(Math.floor(offset / 20) + 1);
            $('#loading-spinner').show(); 
            await fetchPokemonData(offset); 
            $('#loading-spinner').hide(); 
        }
    });


    $('#prev').click(function () {
        if (offset > 0) { 
            offset -= 20; 
            $('#card-container').empty(); 
            $('#page_btn').text(Math.floor(offset / 20) + 1);
            $('#loading-spinner').show(); 
            fetchPokemonData(offset); 
            $('#loading-spinner').hide(); 
        }
    });
});

async function getPokemon(name) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    return response.json();
}

async function getPokemonAll(url) {
    const response = await fetch(url);
    return response.json();
}

async function getPokemonDesc(name) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`);
    return response.json();
}

function renderPokemonCards(pokemonDataArray) {
    pokemonDataArray.forEach(function (pokemon) {
        const cardHtml = generateCard(pokemon);
        $("#card-container").append(cardHtml);

        // Add event listener for "See details" button
        $(`#see-details-${pokemon.id}`).click(function () {
            window.location.href = `details.html?id=${pokemon.id}`;
        });
    });
}

function generateCard(pokemon) {
    const pokeName = toTitleCase(pokemon.name);
    return `
    <div class="col">
        <div class="card" style="width: 18rem;">
            <img src="${pokemon.img}" class="card-img-top" alt="${pokeName}">
            <div class="card-body">
                <h5 class="card-title">${pokeName}</h5>
                <p class="card-text">${pokemon.description}</p>
                <button id="see-details-${pokemon.id}" class="btn btn-outline-secondary">See details</button>
            </div>
        </div>
    </div>
    `;
}

function toTitleCase(str) {
    return str.toLowerCase().replace(/\b\w/g, function (match) {
        return match.toUpperCase();
    });
}

