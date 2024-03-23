import { fns } from './constants.js';
import { generateCardDetails } from '../backend/core.js';
$(document).ready(async function () {

    $('#loading-spinner').show();
    $('#nextx').hide()
    $('#prevx').hide()
    const urlParams = new URLSearchParams(window.location.search);
    const pokemonId = Number(urlParams.get('id'))? Number(urlParams.get('id')) : String(urlParams.get('id'));
    if (pokemonId=="") {
        window.location.href = '../pages/main.html'
    }
        const pokemon = await fns.getPokemon(pokemonId);
        const pokemonDesc = await fns.getPokemonDesc(pokemon.species.name);
        const pokemonLoc = await fns.getPokemonLoc(pokemonId);
        const evolutionChain = await fns.getPokemonEvolutionChain(pokemonDesc?.evolution_chain.url)
        var englishEntries = pokemonDesc.flavor_text_entries.map(entry => {
            return entry?.language?.name === 'en' ? entry?.flavor_text : null
        }).filter(entry => entry !== null)
        var rnd = fns.generateRandom(0, englishEntries.length - 1)

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
                name: pokemon.forms[0].name?? "Pokemon",
                img: pokemon.sprites.other['official-artwork'].front_default ?? "https://pokeapi.co/media/sprites/items/master-ball.png",
                description: (englishEntries[rnd] || "No description available").split('\n').join(' ').replace(/\f/g, ' '),
                id: pokemon.id ?? "0",
                abilities: pokemon.abilities.map(ability => fns.toTitleCase(ability.ability.name) || "No abilities to display").join(', '),
                type: pokemon.types.map(type => fns.toTitleCase(type.type.name) || "Nothing to display here"),
                color: pokemonDesc.color.name ?? "Unknown",
                height: fns.height(pokemon.height) ?? "Unknown",
                weight: fns.weight(pokemon.weight) ?? "Unknown",
                location: pokemonLoc.map(location => fns.toTitleCase(location.location_area.name) ?? "Unknown").join(', '),
                front: pokemon?.sprites['other']?.showdown.front_default ?? pokemon.sprites.back_default,
                back: pokemon?.sprites['other']?.showdown.back_default ?? pokemon.sprites.front_default ,
                hp: pokemon.stats[0].base_stat ?? 0,
                statAttack: pokemon.stats[1].base_stat ?? 0,
                statDefense: pokemon.stats[2].base_stat ?? 0,
                statSpeed: pokemon.stats[5].base_stat ?? 0,
                evolutionChain: filteredEvolve ?? []
            };

        
        generateCardDetails(pokemonDetails)

    $('#loading-spinner').hide();
    if(typeof(pokemonId)=="number") {
        $('#nextx').show()
        $('#prevx').show()
    }
    $('#goBack').click(async () => {
        var offset = localStorage.getItem('offset')
        var page_number = localStorage.getItem('page_number')
        window.location.href = `../pages/main.html?offset=${offset}&page=${page_number}`;
    })

    $('#home').click(() => {
        window.location.href = '../pages/main.html'
    });
    $('#nextx').click(() => {
        var pokemonIdIncrement = parseInt(pokemonId) + 1;
        window.location.href = `../pages/details.html?id=${pokemonIdIncrement}`;
    });

    $('#prevx').click(() => {
        if (parseInt(pokemonId) > 1) {
            var id = parseInt(pokemonId) - 1;
            window.location.href = `../pages/details.html?id=${id}`;
        }
    });

})
