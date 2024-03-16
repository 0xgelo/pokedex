import { fns } from './constants.js';

$(document).ready(async function () {


    // Show loading spinner
    $('#loading-spinner').show();
    $('#errorMsg').empty();
    const urlParams = new URLSearchParams(window.location.search);
    const pokemonOffset = Number(urlParams.get('offset'));
    const page = urlParams.get('page');

    if (pokemonOffset) {
        $('#card-container').empty();
        fetchPokemonData(pokemonOffset)
        $('#page_btn').text(page)
    }
    fns.clearState();

    var offset = pokemonOffset ? pokemonOffset : 0;
    var pokeCount = 0;
    var pgNo = Math.floor(offset / 20) + 1

    localStorage.setItem('offset', offset);
    localStorage.setItem('page_number', pgNo);

    async function fetchPokemonData(offset) {
        var pokeEndpoint = `https://pokeapi.co/api/v2/pokemon/?limit=20&offset=${offset}`;
        var result = await fns.getPokemonAll(pokeEndpoint);
        pokeCount = Math.ceil(result.count / 20);
        const pokemonDataArray = [];
        console.log("Pokecount: ", pokeCount);
        await Promise.all(result.results.map(async function (pokemon) {
            try {
                const pokemonData = await fns.getPokemon(pokemon.name.toLowerCase());
                const pokemonDesc = await fns.getPokemonDesc(pokemon.name);
                const desc = pokemonDesc.flavor_text_entries[0];
                const engDesc = desc.language.name === "en" ? desc.flavor_text : pokemonDesc.flavor_text_entries[0 + 1].flavor_text;
                const hp = pokemonData.stats[0].base_stat;
                const imgSrc = pokemonData.sprites.other.dream_world.front_default;
                const statAttack = pokemonData.stats[1].base_stat;
                const statDefense = pokemonData.stats[2].base_stat;
                const statSpeed = pokemonData.stats[5].base_stat;
                console.log(engDesc);
                pokemonDataArray.push({
                    id: pokemonData.id,
                    name: pokemonData.name,
                    img: pokemonData.sprites.other['official-artwork'].front_default,
                    description: engDesc.split('\n').join(' ').replace(/\f/g, ' '),
                    type: pokemonData.types.map(type => fns.toTitleCase(type.type.name)),
                    statAttack,
                    statDefense,
                    statSpeed,
                    hp,
                });
            } catch (error) {
                console.error(`Error fetching data for ${pokemon.name}:`, error);
            }
        }));

        console.log(pokemonDataArray);
        renderPokemonCards(pokemonDataArray);
        $('#loading-spinner').hide();
    }

    fetchPokemonData(offset);

    $('#next').click(async function () {
        $('#errorMsg').empty();
        offset += 20;
        if (offset < pokeCount * 20) {
            $('#card-container').empty();
            $('#page_btn').text(Math.floor(offset / 20) + 1);
            $('#loading-spinner').show();
            await fetchPokemonData(offset);
            $('#loading-spinner').hide();
            pgNo = $('#page_btn').text()
            localStorage.setItem('page_number', pgNo);
        }
        localStorage.setItem('offset', offset);
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
            localStorage.setItem('offset', offset);
            pgNo = $('#page_btn').text()
            localStorage.setItem('page_number', pgNo);
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
        const offset = pagenumber * 20
        console.log(pagenumber)
        console.log(offset)
        $('#card-container').empty();
        fetchPokemonData(offset)
        pgNo = pagenumber
        localStorage.setItem('page_number', pgNo);
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
            const hp = pokemonData.stats[0].base_stat;
            const imgSrc = pokemonData.sprites.other.dream_world.front_default;
            const statAttack = pokemonData.stats[1].base_stat;
            const statDefense = pokemonData.stats[2].base_stat;
            const statSpeed = pokemonData.stats[5].base_stat;
            const pokemonInfo = {
                id: pokemonDesc.id,
                name: pokemonDesc.name,
                img: pokemonData.sprites.other['official-artwork'].front_default,
                description: engDesc.split('\n').join(' ').replace(/\f/g, ' '),
                type: pokemonData.types.map(type => fns.toTitleCase(type.type.name)),
                hp,
                statAttack,
                statDefense,
                statSpeed
            };


            const cardHtml = generateCard(pokemonInfo);
            $('#card-container').append(cardHtml);

            $(`#see-details-${pokemonInfo.id}`).click(function () {
                window.location.href = `details.html?id=${pokemonInfo.id}`;
            });
            $('#loading-spinner').hide();
        }

    });

    //END OF DOCUMENT.READY
});

function renderPokemonCards(pokemonDataArray) {
    pokemonDataArray.forEach(function (pokemon) {
        const cardHtml = generateCard(pokemon);
        $("#card-container").append(cardHtml);



        // Add event listener for "See details" button
        $(`#see-details-${pokemon.id}`).click(async function () {
            window.location.href = `details.html?id=${pokemon.id}`;
        });
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
        <div class="card pokemon-card" style="width: 18rem; background-image: radial-gradient(circle at 50% 0%, ${bColor} 36%, #ffffff 36%);">
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
                <button id="see-details-${pokemon.id}" class="btn btn-outline-secondary mt-3">See details</button>
            </div>
        </div>
    </div>
    `;
}

