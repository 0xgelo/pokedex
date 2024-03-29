import { fns } from './constants.js';
import { fetchPokemonData, getPokemonInfo, generateCard } from '../backend/core.js';
$(document).ready(async function () {

    $('#loading-spinner').show();
    $('#errorMsg').empty();

    const urlParams = new URLSearchParams(window.location.search);
    const pokemonOffset = Number(urlParams.get('offset'));
    const page = Number(urlParams.get('page_number'));
    if (pokemonOffset) {
        $('#card-container').empty();
        fetchPokemonData(pokemonOffset)
        $('.page_btn').text(page)
    }
    fns.clearState();

    var offset = pokemonOffset? pokemonOffset: 0;
    var pokeCount = 0;
    $('.page_btn').text(Math.floor(offset/4)+1)

    fetchPokemonData(offset);
    localStorage.setItem('offset', offset);

    $(document).on('click', '.card', function(){
        var __this = unformatID($(this).attr('id').split('-')[1]);
        if (__this){
            window.location.href = `../pages/details.html?id=${__this}`
        }
        else if(__this ==="null"){
            window.location.href = `../pages/details.html?id=${$(this).attr('class').split(' ')[2]}`
        }
        
    })

    $('.next').click(async function () {
        $('#errorMsg').empty();
        offset+=4
        $('#card-container').empty();
        $('.page_btn').text(Math.floor(offset / 4) +1 );
        $('#loading-spinner').show();
        await fetchPokemonData(offset);
        $('#loading-spinner').hide();
        localStorage.setItem('page_number', Math.floor(offset / 4) +1 );
        localStorage.setItem('offset', offset);
    });


    $('.prev').click(async function () {
        $('#errorMsg').empty();
        if (offset > 1) {
            offset -= 4;
            $('#card-container').empty();
            $('.page_btn').text(Math.floor(offset / 4)+1);
            $('#loading-spinner').show();
            await fetchPokemonData(offset);
            $('#loading-spinner').hide();
            localStorage.setItem('offset', offset);
            localStorage.setItem('page_number', Math.floor(offset / 4)+1);
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
        if(pagenumber < 66){
        offset = pagenumber * 4
        
        $('#card-container').empty();
        fetchPokemonData(offset)
        $('.page_btn').text(Math.floor(offset / 4));
        localStorage.setItem('page_number', Math.floor(offset / 4));
        localStorage.setItem('offset', offset)
        }

    })

    // SEARCH BOX
    $('#go').click(async function () {
        $('#card-container').empty();
        $('#loading-spinner').show();
        $('#errorMsg').empty();
        const pokemonName = $('#input').val().toLowerCase(); // Store the entered Pokemon name
        if(pokemonName !== "") {
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
                    window.location.href = `../pages/details.html?id=${pokemonInfo.id}`;
                })
    
            }
        }
        else {
            $('#loading-spinner').hide();
            $('#errorMsg').text(`Please enter a valid pokemon name`);
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
                window.location.href = `../pages/details.html?id=${pokemonInfo.id}`;
            })

        }catch(error){
            $('#errorMsg').text('Oops! Something went wrong, Please try to generate again :)')
            $('#loading-spinner').hide();
        }
    })
    
    $('#home').on('click', function() {
        window.location.href = '../pages/main.html'
    })

    //END OF DOCUMENT.READY
});

function unformatID(formattedID) {
    const unformatted = parseInt(formattedID, 10);
    return isNaN(unformatted) ? null : unformatted;
}