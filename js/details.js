import { fns } from './constants.js';

$(document).ready(async function () {

    const urlParams = new URLSearchParams(window.location.search);
    const pokemonId = urlParams.get('id');
    $('#loading-spinner').show();
    $('#pokemon-image').hide();

    const pokemon = await fns.getPokemon(pokemonId);
    const pokemonDesc = await fns.getPokemonDesc(pokemon.name);
    const pokemonLoc = await fns.getPokemonLoc(pokemonId);

    const desc = pokemonDesc.flavor_text_entries[0]
    const engDesc = desc.language.name === "en" ? desc.flavor_text : pokemonDesc.flavor_text_entries[0 + 1].flavor_text;

    const evolutionChainUrl = pokemonDesc.evolution_chain.url
    const evolutionChain = await fns.getPokemonEvolutionChain(evolutionChainUrl)
    const evolve = [
        evolutionChain.chain?.species?.name,
        evolutionChain.chain?.evolves_to[0]?.species?.name,
        evolutionChain.chain?.evolves_to[0]?.evolves_to[0]?.species?.name
    ];

    const evolveIds = await Promise.all(evolve.map(async pokemon => {
        const result = await fns.getPokemon(pokemon);
        return result?.id;
    }));

    const filteredEvolve = evolve
        .map((pokemon, index) => ({ pokemon, id: evolveIds[index] }))
        .filter(item => item.pokemon !== undefined && item.id !== undefined);

    const pokemonDetails = {
        name: pokemon.name,
        img: pokemon.sprites.other['official-artwork'].front_default,
        description: engDesc.split('\n').join(' ').replace(/\f/g, ' '),
        id: pokemonDesc.id,
        abilities: pokemon.abilities.map(ability => fns.toTitleCase(ability.ability.name)).join(', '),
        type: pokemon.types.map(type => fns.toTitleCase(type.type.name)),
        color: pokemonDesc.color.name,
        height: fns.height(pokemon.height),
        weight: fns.weight(pokemon.weight) +" lbs",
        location: pokemonLoc.map((location => fns.toTitleCase(location.location_area.name))).join(', '),

    }
    addAdditionalDetails(pokemonDetails)
    addEvolutionChain(filteredEvolve)

    $('#pokemon-name').text(fns.toTitleCase(pokemon.name));
    $('#pokemon-description').html(`${pokemonDetails.description}`);
    $('#pokemon-image').attr('src', pokemonDetails.img)
    $('#pokemon-image').show()
    $('#loading-spinner').hide();

    $('#goBack').click(() => {

        history.back();
    })
})

async function addAdditionalDetails(details) {
    const types = details.type;
    let typeHTML = '';
    types.forEach(type => {
        const color = fns.colors[type.toLowerCase()] || 'black'; // Get color from colours object or default to black
        typeHTML += `<span class="pokemon-type" style="background-color: ${color};">${type}</span>`;
        console.log(typeHTML);
    });

    $('#additional-details').html(`
    <div class="card-suit">#${details.id}</div>
        <p class="card-text">
            <span class="fw-bold">Height:</span> ${details.height} &emsp;
            <span class="fw-bold">Weight:</span> ${details.weight}
        </p>
        <p class="card-text">
            <span class="fw-bold">Type:</span> ${typeHTML} &emsp;
            <span class="fw-bold">ID:</span> ${details.id}
        </p>
        <p class="card-text">
            <span class="fw-bold">Abilities:</span> ${details.abilities} &emsp;
        </p>
        <p class="card-text">
            <span class="fw-bold">Color:</span> ${details.color} &emsp;
        </p>
        <p class="card-text">
            <span class="fw-bold">Location:</span> ${details.location ? details.location : 'Unknown'}
        </p>
    `);
}


async function addEvolutionChain(chain) {
    console.log("chain", chain);
    const $additionalDetailsDiv = $("#additional-details");
    const $evolutionDiv = $("<div>");
    $evolutionDiv.append("<h4>Evolution Chain:</h4>");
    
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
        $evolutionDiv.append($img);

        if (i !== chain.length - 1) {
            $evolutionDiv.append("<span>→</span>");
        }

        // Attach click event listener directly inside the loop
        $img.on('click', function() {
            const clickedId = $(this).attr('id');
            window.location.href = `details.html?id=${pokemon.id}`;
        });
    }
    $additionalDetailsDiv.append($evolutionDiv);
}

