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
                    description: (englishEntries[rnd] ?? "No description available").split('\n').join(' ').replace(/\f/g, ' '), // Default value for description
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



    $('.next').click(async function () {
        $('#errorMsg').empty();
        offset+=20
        console.log("OFFSET", offset);
        if (offset < pokeCount * 20) {
            $('#card-container').empty();
            $('.page_btn').text(offset===20? Math.floor((offset) / 20)+1: Math.floor((offset) / 20));
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
        const pagenumber = Number($('#forward_input').val()) ===0? 1 : Number($('#forward_input').val())
        console.log("PG", pagenumber)
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
            const pokemonInfo = await getPokemonInfo(pokemonData.name)
            const cardHtml = generateCard(pokemonInfo);
            $('#card-container').append(cardHtml);
            $('#loading-spinner').hide();
            $(`#card-${pokemonInfo.id}`).on('click', async function(){
                window.location.href = `details.html?id=${pokemonInfo.id}`;
            })

        }

    });

    $('#random').on('click', async function() {
        $('#home').show();
        $('#card-container').empty();
        $('#loading-spinner').show();
        $('#errorMsg').empty();
        var rnd = fns.generateRandom(1, 1032)
        
        try {
            const pokemonInfo = await getPokemonInfo(rnd)
            const cardHtml = generateCard(pokemonInfo);
            $('#card-container').append(cardHtml);
            $('#loading-spinner').hide();
            $(`#card-${pokemonInfo.id}`).on('click', async function(){
                window.location.href = `details.html?id=${pokemonInfo.id}`;
            })

        }catch(error){
            $('#errorMsg').text('Oops! Something went wrong, Please try to generate again :)')
            $('#loading-spinner').hide();
        }
    })
    
    $('#home').on('click', function() {
        window.location.reload()
    })

    //END OF DOCUMENT.READY
});

function renderPokemonCards(pokemonDataArray) {
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

function generateErrorCard(pokemon) {
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

function generateCard(pokemon) {
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
async function getPokemonInfo(pokemon) {
    const pokemonData = await fns.getPokemon(pokemon);
    const pokemonDesc = await fns.getPokemonDesc(pokemon);
    var englishEntries = pokemonDesc.flavor_text_entries.map(entry => {
        return entry?.language?.name ==='en'? entry?.flavor_text: null
    }).filter(entry => entry!== null)
    var rnd = fns.generateRandom(0, englishEntries.length-1)
    
    return {
        id: pokemonDesc.id,
        name: pokemonDesc.name,
        img: pokemonData.sprites.other['official-artwork'].front_default,
        description: englishEntries[rnd].split('\n').join(' ').replace(/\f/g, ' '),
        type: pokemonData.types.map(type => fns.toTitleCase(type.type.name)),
        hp: pokemonData.stats[0].base_stat,
        statAttack: pokemonData.stats[1].base_stat,
        statDefense: pokemonData.stats[2].base_stat,
        statSpeed:pokemonData.stats[5].base_stat,
    };
}