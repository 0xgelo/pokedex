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

    const firstEvolve = evolutionChain.chain?.species?.name ? evolutionChain.chain.species.name : undefined
    const secondEvolve = evolutionChain.chain?.evolves_to[0]?.species?.name ? evolutionChain.chain.evolves_to[0].species.name : undefined
    const thirdEvolve = evolutionChain.chain?.evolves_to[0]?.evolves_to[0]?.species.name ? evolutionChain.chain.evolves_to[0].evolves_to[0].species.name : undefined

    const evolve = [firstEvolve, secondEvolve, thirdEvolve]

    const pokemonDetails = {
        name: pokemon.name,
        img: pokemon.sprites.other['official-artwork'].front_default,
        description: engDesc.split('\n').join(' ').replace(/\f/g, ' '),
        id: pokemonDesc.id,
        abilities: pokemon.abilities.map(ability => fns.toTitleCase(ability.ability.name)).join(', '),
        type: pokemon.types.map(type => fns.toTitleCase(type.type.name)).join(', '),
        color: pokemonDesc.color.name,
        height: Math.round(pokemon.height * 3.937) + " inch",
        weight: pokemon.weight / 10 + " kg",
        location: pokemonLoc.map((location => fns.toTitleCase(location.location_area.name))).join(', '),

    }
    addAdditionalDetails(pokemonDetails)
    addEvolutionChain(evolve)

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
    $('#additional-details').html(`
        <p class="card-text">
            <span class="fw-bold">Height:</span> ${details.height} &emsp;
            <span class="fw-bold">Weight:</span> ${details.weight}
        </p>
        <p class="card-text">
            <span class="fw-bold">Type:</span> ${details.type} &emsp;
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
    const $additionalDetailsDiv = $("#additional-details");
    const $evolutionDiv = $("<div>");
    $evolutionDiv.append("<h4>Evolution Chain:</h4>");
    $.each(chain, async function (index, pokemon) {
        const pokemonImg = await fns.getPokemon(pokemon);
        const $img = $("<img>");

        $img.attr({
            src: `${pokemonImg.sprites.other['official-artwork'].front_default}`,
            alt: pokemon,
            title: pokemon,
            width: 50
        });
        $evolutionDiv.append($img);


        if (index !== chain.length - 1) {
            $evolutionDiv.append("<span>→</span>");
        }
    });

    $additionalDetailsDiv.append($evolutionDiv);
}