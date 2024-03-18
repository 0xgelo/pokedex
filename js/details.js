import { fns } from './constants.js';

$(document).ready(async function () {

    $('#loading-spinner').show();
    $('#nextx').hide()
    $('#prevx').hide()
    const urlParams = new URLSearchParams(window.location.search);
    const pokemonId = urlParams.get('id');

    if (!pokemonId) {
        window.location.href = '../pages/main.html'
    }
    try {
        const pokemon = await fns.getPokemon(pokemonId);
        const pokemonDesc = await fns.getPokemonDesc(pokemon.name);
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
            name: pokemon.name,
            img: pokemon.sprites.other['official-artwork'].front_default,
            description: englishEntries[rnd].split('\n').join(' ').replace(/\f/g, ' '),
            id: pokemonDesc.id,
            abilities: pokemon.abilities.map(ability => fns.toTitleCase(ability.ability.name)).join(', '),
            type: pokemon.types.map(type => fns.toTitleCase(type.type.name)),
            color: pokemonDesc.color.name,
            height: fns.height(pokemon.height),
            weight: fns.weight(pokemon.weight),
            location: pokemonLoc.map((location => fns.toTitleCase(location.location_area.name))).join(', '),
            front: pokemon?.sprites['other']?.showdown.front_default,
            back: pokemon?.sprites['other']?.showdown.back_default,
            hp: pokemon.stats[0].base_stat,
            statAttack: pokemon.stats[1].base_stat,
            statDefense: pokemon.stats[2].base_stat,
            statSpeed: pokemon.stats[5].base_stat,
            evolutionChain: filteredEvolve
        }

        generateCard(pokemonDetails)
    }
    catch (err) {
        $('#errorMsg').html(`Oops! Something went wrong! Seems like the Pokemon with id ${pokemonId} got some info that is broken. <br> Please go to the next Pokemon`)
    }

    $('#loading-spinner').hide();

    $('#nextx').show()
    $('#prevx').show()
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
        window.location.href = `details.html?id=${pokemonIdIncrement}`;
    });

    $('#prevx').click(() => {
        if (parseInt(pokemonId) > 1) {
            var id = parseInt(pokemonId) - 1;
            window.location.href = `details.html?id=${id}`;
        }
    });

})

async function addEvolutionChain(chain) {

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

        // Attach click event listener directly inside the loop
        $img.on('click', function () {
            const clickedId = $(this).attr('id');
            window.location.href = `details.html?id=${pokemon.id}`;
        });
    }
}

function generateCard(pokemon) {

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