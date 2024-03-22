import { fns } from '../js/constants.js';

const fetchPokemonData = async function(offset) {
    var pokeEndpoint = `https://pokeapi.co/api/v2/pokemon/?limit=20&offset=${offset}`;
    var result = await fns.getPokemonAll(pokeEndpoint);
    const pokemonDataArray = [];
    await Promise.all(result.results.map(async function (pokemon) {
        try {
            const pokemonData = await fns.getPokemon(pokemon.name.toLowerCase());
            console.log()
            const pokemonDesc = await fns.getPokemonDesc(pokemonData.species.name);
            var englishEntries = pokemonDesc?.flavor_text_entries
            ?.map(entry => {
                return entry?.language?.name === 'en' ? entry?.flavor_text : null;
            })
            .filter(entry => entry !== null);
        
        if (englishEntries.length === 0) {
            englishEntries = ["Nothing to show here"];
        }
                var rnd = fns.generateRandom(0, (englishEntries ?? []).length-1);
            pokemonDataArray.push({
                id: pokemonData.id ?? 0, // Default value for id
                name: pokemonData.name ?? "Unknown", // Default value for name
                img: pokemonData.sprites.other['official-artwork'].front_default ?? "https://pokeapi.co/media/sprites/items/master-ball.png", // Default value for img
                description: (englishEntries[rnd] || "No description available").split('\n').join(' ').replace(/\f/g, ' '),
                type: pokemonData.types.map(type => fns.toTitleCase(type.type.name)) ?? [], // Default value for type
                statAttack: pokemonData.stats[1].base_stat ?? 0, // Default value for statAttack
                statDefense: pokemonData.stats[2].base_stat ?? 0, // Default value for statDefense
                statSpeed: pokemonData.stats[5].base_stat ?? 0, // Default value for statSpeed
                hp: pokemonData.stats[0].base_stat ?? 0 // Default value for hp
            });
        } catch (error) {
            console.error(`Error fetching data for ${pokemon.name}:`, error);
        }
    }));

    renderPokemonCards(pokemonDataArray);
    $('#loading-spinner').hide();
}

const renderPokemonCards = function(pokemonDataArray) {
    pokemonDataArray.forEach(function (pokemon) {
        if (pokemon.id === 0 || pokemon.name === "Unknown" || pokemon.img === "default_image_url") {
            // Handle the case where data is missing or invalid
            const cardHtml = generateErrorCard(pokemon); // Create a special error card
            $("#card-container").append(cardHtml);
        } else {
            // Render the regular Pokémon card
            const cardHtml = generateCard(pokemon);
            $("#card-container").append(cardHtml);
        }
    });
}


const generateErrorCard = function(pokemon) {
    return `
    <div class="col">
        <div class="card pokemon-card" style="width: 18rem;">
            <div class="card-body">
                <h5 class="card-title">Error Fetching Pokémon</h5>
                <p class="card-text">An error occurred while fetching data for this Pokémon.</p>
            </div>
        </div>
    </div>
    `;
}

const generateCard = function(pokemon) {
    const types = pokemon.type;
    let typeHTML = '';
    let bColor;
    types.forEach(type => {
        const color = fns.colors[type.toLowerCase()] || 'black'; // Get color from colours object or default to black
        typeHTML += `<span class="pokemon-type" style="background-color: ${color};">${type}</span>`;
        bColor = color; // Set background color for the card
    });
    const truncatedDescription = pokemon.description.length > 70 ? pokemon.description.substring(0, 70) + " <i style='color:black;'>...click to see more</i>" : pokemon.description;

    const pokeName = fns.toTitleCase(pokemon.name);
    return `
    <div class="col">
        <div class="card pokemon-card ${pokemon.name}" style="width: 18rem; background-image: radial-gradient(circle at 50% 0%, ${bColor} 36%, #ffffff 36%); cursor:pointer;" id="card-${pokemon.id}">
        <p class="hp">
        <span>HP</span>
            ${pokemon.hp}
        </p>
        <div class="card-suit" style="color: white;">#${pokemon.id}</div>
            <img src="${pokemon.img}" class="card-img-top" alt="${pokeName}">
            <div class="card-body">
                <h5 class="card-title">${pokeName}</h5>
                &emsp; ${typeHTML} &emsp;
                <p class="card-text mt-2">${truncatedDescription}</p>
                <div class="stats">
                <div>
                <h3 class="fw-bold">${pokemon.statAttack}</h3>
                <p>Attack</p>
                </div>
                <div>
                <h3 class="fw-bold">${pokemon.statDefense}</h3>
                <p>Defense</p>
                </div>
                <div>
                <h3 class="fw-bold">${pokemon.statSpeed}</h3>
                <p>Speed</p>
                </div>
            </div>
            <div class="card-footer" style="background-color: ${bColor}; height: 10px;"></div> 
            </div>
        </div>
        
    </div>
    `;
}

const getPokemonInfo = async function(pokemon) {
    const pokemonData = await fns.getPokemon(pokemon);
    const pokemonDesc = await fns.getPokemonDesc(pokemonData.species.name);
    var englishEntries = pokemonDesc.flavor_text_entries.map(entry => {
        return entry?.language?.name ==='en'? entry?.flavor_text: null
    }).filter(entry => entry!== null)
    var rnd = fns.generateRandom(0, englishEntries.length-1)
    
    return {
        id: pokemonDesc.id ?? 0, // Default value for id
        name: pokemonData.name ?? "Unknown", // Default value for name
        img: pokemonData.sprites.other['official-artwork'].front_default ?? "https://pokeapi.co/media/sprites/items/master-ball.png", // Default value for img
        description: (englishEntries[rnd] ?? "No description available").split('\n').join(' ').replace(/\f/g, ' '), // Default value for description
        type: pokemonData.types.map(type => fns.toTitleCase(type.type.name)) ?? [], // Default value for type
        hp: pokemonData.stats[0].base_stat ?? 0, // Default value for hp
        statAttack: pokemonData.stats[1].base_stat ?? 0, // Default value for statAttack
        statDefense: pokemonData.stats[2].base_stat ?? 0, // Default value for statDefense
        statSpeed: pokemonData.stats[5].base_stat ?? 0, // Default value for statSpeed
    };
    
}

const generateCardDetails = function(pokemon) {

    const types = pokemon.type;
    let typeHTML = '';
    let bColor;
    types.forEach(type => {
        const color = fns.colors[type.toLowerCase()] || 'black';
        typeHTML += `<span class="pokemon-type" style="background-color: ${color}; font-size: 1.2em;">${type}</span>`;
        bColor = color;
    });

    const pokeName = fns.toTitleCase(pokemon.name);

    var html = `
    <div class="col">
        <div class="card pokemon-card" style="width: 30rem; background-image: radial-gradient(circle at 50% 0%, ${bColor} 36%, #ffffff 36%);">
        <p class="hp">
        <span>HP</span>
            ${pokemon.hp}
        </p>
        <div class="card-suit" style="color: white;">#${pokemon.id}</div>
            <img src="${pokemon.img}" class="card-img-top" alt="${pokeName}">
            <div class="card-body">
                <h5 class="card-title">${pokeName}</h5>
                &emsp; ${typeHTML} &emsp;
                <p class="card-text mt-2">${pokemon.description}</p>
                <img src="${pokemon.back}" style="width: 70px;">
                <img src="${pokemon.front}" style="width: 70px;">
                <div class="stats mx-5 mt-3">
                <div><h3 class="fw-bold">${pokemon.statAttack}</h3><p>Attack</p></div>
                <div><h3 class="fw-bold">${pokemon.statDefense}</h3><p>Defense</p></div>
                <div><h3 class="fw-bold">${pokemon.statSpeed}</h3><p>Speed</p></div>
                </div>
                <div class="stats mx-5">
                <div><h3 class="fw-bold">${pokemon.height}</h3><p>Height</p></div>
                <div><h3 class="fw-bold">${pokemon.weight}</h3><p>Weight</p></div>
                <div><h3 class="fw-bold">${pokemon.color}</h3><p>Color</p></div>
                </div>
                <div class="stats mx-5">
                </div>
                <p class="card-text"><span class="fw-bold">Abilities</span> ${pokemon.abilities}</p>
                <p class="card-text"><span class="fw-bold">Location:</span> ${pokemon.location ? pokemon.location : 'Unknown. It cant be seen on map'}</p>
    </div>
    </div>
    </div>
    `;

    addEvolutionChain(pokemon.evolutionChain)

    $("#card-container").append(html);
}

const addEvolutionChain= async function(chain) {
    $(document).ready(function() {
        $(".card-body").append("<h2> Evolution Chain </h2>")
    })
    
    for (let i = 0; i < chain.length; i++) {
        const pokemon = chain[i];
        const pokemonImg = await fns.getPokemon(pokemon.pokemon);
        const $img = $(`<img style="cursor:pointer" class="evolveImg" id="evolve-${pokemon.id}">`);
        $img.attr({
            src: `${pokemonImg.sprites.other['official-artwork'].front_default}`,
            alt: pokemon.pokemon,
            title: pokemon.pokemon,
            width: 80
        });
        $(".card-body").append($img);

        if (i !== chain.length - 1) {
            $(".card-body").append("<span>→</span>");
        }

        $img.on('click', function () {
            const clickedId = $(this).attr('id');
            window.location.href = `details.html?id=${pokemon.id}`;
        });
    }
}

export {
    fetchPokemonData,
    getPokemonInfo,
    generateCard,
    renderPokemonCards,
    generateErrorCard,
    generateCardDetails,
}