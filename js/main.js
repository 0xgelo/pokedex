import { fns } from './constants.js';

$(document).ready(async function () {

    $('#loading-spinner').show();
    $('#errorMsg').empty();

    const urlParams = new URLSearchParams(window.location.search);
    const pokemonOffset = Number(urlParams.get('offset'));
    const page = urlParams.get('page');

    if (pokemonOffset) {
        $('#card-container').empty();
        fetchPokemonData(pokemonOffset)
        $('.page_btn').text(page)
    }

    fns.clearState();

    var offset = pokemonOffset? pokemonOffset: 0;
    var pokeCount = 0;
    if(offset === 0) {
        
    }
    offset === 0 ? $('.page_btn').text(Math.floor(offset/20)+1) : $('.page_btn').text(Math.floor(offset/20))

    fetchPokemonData(offset);
    localStorage.setItem('offset', offset);

    async function fetchPokemonData(offset) {
        var pokeEndpoint = `https://pokeapi.co/api/v2/pokemon/?limit=20&offset=${offset}`;
        var result = await fns.getPokemonAll(pokeEndpoint);
        pokeCount = Math.ceil(result.count / 20);
        const pokemonDataArray = [];
        await Promise.all(result.results.map(async function (pokemon) {
            try {
                const pokemonData = await fns.getPokemon(pokemon.name.toLowerCase());
                const pokemonDesc = await fns.getPokemonDesc(pokemon.name);
                const desc = pokemonDesc.flavor_text_entries[0];
                const engDesc = desc.language.name === "en" ? desc.flavor_text : pokemonDesc.flavor_text_entries[0 + 1].flavor_text;

                pokemonDataArray.push({
                    id: pokemonData.id,
                    name: pokemonData.name,
                    img: pokemonData.sprites.other['official-artwork'].front_default,
                    description: engDesc.split('\n').join(' ').replace(/\f/g, ' '),
                    type: pokemonData.types.map(type => fns.toTitleCase(type.type.name)),
                    statAttack: pokemonData.stats[1].base_stat,
                    statDefense: pokemonData.stats[2].base_stat,
                    statSpeed: pokemonData.stats[5].base_stat,
                    hp: pokemonData.stats[0].base_stat,
                });
            } catch (error) {
                console.error(`Error fetching data for ${pokemon.name}:`, error);
            }
        }));

        renderPokemonCards(pokemonDataArray);
        $('#loading-spinner').hide();
    }



    $('.next').click(async function () {
        $('#errorMsg').empty();
        offset = offset + 20;
        if (offset < pokeCount * 20) {
            $('#card-container').empty();
            $('.page_btn').text(Math.floor(offset / 20));
            $('#loading-spinner').show();
            await fetchPokemonData(offset);
            $('#loading-spinner').hide();
            localStorage.setItem('page_number', Math.floor(offset / 20));
        }
        
        localStorage.setItem('offset', offset);
    });


    $('.prev').click(async function () {
        $('#errorMsg').empty();
        if (offset > 1) {
            offset -= 20;
            $('#card-container').empty();
            $('.page_btn').text(Math.floor(offset / 20));
            $('#loading-spinner').show();
            await fetchPokemonData(offset);
            $('#loading-spinner').hide();
            localStorage.setItem('offset', offset);
            localStorage.setItem('page_number', Math.floor(offset / 20));
        }
    });

    $('#input').on('change', function () {
        $('#errorMsg').empty();
        if ($(this).val() === '') {
            $('#card-container').empty();
            fetchPokemonData(offset)
        }
    })

    $('#forward').on('click', async function () {
        $('#loading-spinner').show();
        const pagenumber = Number($('#forward_input').val())
        
        if(pagenumber < 66){
        offset = pagenumber * 20
        
        $('#card-container').empty();
        fetchPokemonData(offset)
        $('.page_btn').text(Math.floor(offset / 20));
        localStorage.setItem('page_number', Math.floor(offset / 20));
        localStorage.setItem('offset', offset)
        }

    })

    // SEARCH BOX
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
        else {
            const pokemonDesc = await fns.getPokemonDesc(pokemonName);
            const desc = pokemonDesc.flavor_text_entries[0];
            const engDesc = desc.language.name === "en" ? desc.flavor_text : pokemonDesc.flavor_text_entries[0 + 1].flavor_text;

            const pokemonInfo = {
                id: pokemonDesc.id,
                name: pokemonDesc.name,
                img: pokemonData.sprites.other['official-artwork'].front_default,
                description: engDesc.split('\n').join(' ').replace(/\f/g, ' '),
                type: pokemonData.types.map(type => fns.toTitleCase(type.type.name)),
                hp: pokemonData.stats[0].base_stat,
                statAttack: pokemonData.stats[1].base_stat,
                statDefense: pokemonData.stats[2].base_stat,
                statSpeed:pokemonData.stats[5].base_stat,
            };


            const cardHtml = generateCard(pokemonInfo);
            $('#card-container').append(cardHtml);

            $(`#card-${pokemon.id}`).on('click', async function(){
                window.location.href = `details.html?id=${pokemon.id}`;
            })
            $('#loading-spinner').hide();
        }

    });

    //END OF DOCUMENT.READY
});

function renderPokemonCards(pokemonDataArray) {
    pokemonDataArray.forEach(function (pokemon) {
        const cardHtml = generateCard(pokemon);
        $("#card-container").append(cardHtml);

        $(`#card-${pokemon.id}`).on('click', async function(){
            window.location.href = `details.html?id=${pokemon.id}`;
        })

    });
}

function generateCard(pokemon) {
    const types = pokemon.type;
    let typeHTML = '';
    let bColor;
    types.forEach(type => {
        const color = fns.colors[type.toLowerCase()] || 'black'; // Get color from colours object or default to black
        typeHTML += `<span class="pokemon-type" style="background-color: ${color};">${type}</span>`;
        bColor = color; // Set background color for the card
    });

    const pokeName = fns.toTitleCase(pokemon.name);
    return `
    <div class="col">
        <div class="card pokemon-card" style="width: 18rem; background-image: radial-gradient(circle at 50% 0%, ${bColor} 36%, #ffffff 36%); cursor:pointer;" id="card-${pokemon.id}">
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
