import { fns } from './constants.js';

$(document).ready(async function () {
    // Show loading spinner
    $('#loading-spinner').show();
    $('#errorMsg').empty();

    var offset = 0;
    var pokeCount = 0;
    $('#input').on('change', function(){
        $('#errorMsg').empty();
        if ($(this).val() === ''){
            $('#card-container').empty();
            fetchPokemonData(offset)
        }
    })

    async function fetchPokemonData(offset) {
        var pokeEndpoint = `https://pokeapi.co/api/v2/pokemon/?limit=20&offset=${offset}`;
        var result = await fns.getPokemonAll(pokeEndpoint);
        console.log(result);
        pokeCount = Math.ceil(result.count / 20); 
        const pokemonDataArray = await Promise.all(result.results.map(async function (pokemon) {
            const pokemonData = await fns.getPokemon(pokemon.name.toLowerCase());
            const pokemonDesc = await fns.getPokemonDesc(pokemonData.name);
            const desc = pokemonDesc.flavor_text_entries[0];
            const engDesc = desc.language.name === "en" ? desc.flavor_text : pokemonDesc.flavor_text_entries[0 + 1].flavor_text;
            return {
                id: pokemonData.id,
                name: pokemonData.name,
                img: pokemonData.sprites.other['official-artwork'].front_default,
                description: engDesc.split('\n').join(' ').replace(/\f/g, ' '),
                type: pokemonData.types.map(type => fns.toTitleCase(type.type.name)),
            };
        }));
        renderPokemonCards(pokemonDataArray);
    }


    fetchPokemonData(offset);
    $('#loading-spinner').hide(); 


    $('#next').click(async function () {
        $('#errorMsg').empty();
        offset += 20; 
        if (offset < pokeCount * 20) { 
            $('#card-container').empty(); 
            $('#page_btn').text(Math.floor(offset / 20) + 1);
            $('#loading-spinner').show(); 
            await fetchPokemonData(offset); 
            $('#loading-spinner').hide(); 
        }
    });


    $('#prev').click(async function () {
        $('#errorMsg').empty();
        if (offset > 0) { 
            offset -= 20; 
            $('#card-container').empty(); 
            $('#page_btn').text(Math.floor(offset / 20) + 1);
            $('#loading-spinner').show(); 
            await fetchPokemonData(offset); 
            $('#loading-spinner').hide(); 
        }
    });


    $('#go').click(async function () {
        $('#card-container').empty();
        $('#loading-spinner').show();
        $('#errorMsg').empty();
        const pokemonName = $('#input').val().toLowerCase(); // Store the entered Pokemon name
        const pokemonData = await fns.getPokemon(pokemonName);
        if (!pokemonData) {
            $('#errorMsg').text(`No Pokémon found with the name "${pokemonName}"`);
            $('#loading-spinner').hide(); 
            return; 
        }
    
        const pokemonDesc = await fns.getPokemonDesc(pokemonData.name);
        const desc = pokemonDesc.flavor_text_entries[0];
        const engDesc = desc.language.name === "en" ? desc.flavor_text : pokemonDesc.flavor_text_entries[0 + 1].flavor_text;
        
        const pokemonInfo = {
            id: pokemonData.id,
            name: pokemonData.name,
            img: pokemonData.sprites.other['official-artwork'].front_default,
            description: engDesc.split('\n').join(' ').replace(/\f/g, ' '),
            type: pokemonData.types.map(type => fns.toTitleCase(type.type.name)),
        };
        const cardHtml = generateCard(pokemonInfo); 
        $('#card-container').append(cardHtml); 

        $(`#see-details-${pokemonInfo.id}`).click(function () {
            window.location.href = `details.html?id=${pokemonInfo.id}`;
        });
        $('#loading-spinner').hide(); 
    });

    //END OF DOCUMENT.READY
});

function renderPokemonCards(pokemonDataArray) {
    pokemonDataArray.forEach(function (pokemon) {
        const cardHtml = generateCard(pokemon);
        $("#card-container").append(cardHtml);

        // Add event listener for "See details" button
        $(`#see-details-${pokemon.id}`).click( async function () {
            window.location.href = `details.html?id=${pokemon.id}`;
        });
    });
}

function generateCard(pokemon) {
    const types = pokemon.type;
    let typeHTML = '';
    types.forEach(type => {
        const color = fns.colors[type.toLowerCase()] || 'black'; // Get color from colours object or default to black
        typeHTML += `<span class="pokemon-type" style="background-color: ${color};">${type}</span>`;
    });
    const pokeName = fns.toTitleCase(pokemon.name);
    return `
    <div class="col">
        <div class="card pokemon-card" style="width: 18rem;">
        <div class="card-suit">#${pokemon.id}</div>
            <img src="${pokemon.img}" class="card-img-top" alt="${pokeName}">
            <div class="card-body">
                <h5 class="card-title">${pokeName}</h5>
                &emsp; ${typeHTML} &emsp;
                <p class="card-text mt-2">${pokemon.description}</p>
                <button id="see-details-${pokemon.id}" class="btn btn-outline-secondary mt-3">See details</button>
            </div>
        </div>
    </div>
    `;
}
