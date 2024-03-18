export const fns = {
    getPokemon: async function(name) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            if (!response.ok) {
                return null;
            }
            return response.json();
        } catch (error) {
            // console.error(error);
            return null; // Return null to indicate that no data was fetched
        }
    }, 

    // Wrap getPokemonAll function with try-catch
    getPokemonAll: async function(url) {
        try {
            const response = await fetch(url);
            return response.json();
        } catch (error) {
            // console.error(error);
            return null;
        }
    },

    // Wrap getPokemonDesc function with try-catch
    getPokemonDesc: async function(name) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`);
            if (!response.ok) {
                return null;
            }
            return response.json();
        } catch (error) {
            // console.error(error);
            return null;
        }
    },

    // Wrap getPokemonLoc function with try-catch
    getPokemonLoc: async function(id) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/encounters`);
            const pokemon = await response.json();
            return pokemon;
        } catch (error) {
            // console.error(error);
            return null;
        }
    },

    // Wrap getPokemonEvolutionChain function with try-catch
    getPokemonEvolutionChain: async function(url) {
        try {
            const response = await fetch(url);
            const pokemon = await response.json();
            return pokemon;
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    toTitleCase: function(str) {
        return str.toLowerCase().replace(/\b\w/g, function (match) {
            return match.toUpperCase();
        });
    },
    colors :  {
        normal: '#A8A77A',
        fire: '#EE8130',
        water: '#6390F0',
        electric: '#F7D02C',
        grass: '#7AC74C',
        ice: '#96D9D6',
        fighting: '#C22E28',
        poison: '#A33EA1',
        ground: '#E2BF65',
        flying: '#A98FF3',
        psychic: '#F95587',
        bug: '#A6B91A',
        rock: '#B6A136',
        ghost: '#735797',
        dragon: '#6F35FC',
        dark: '#705746',
        steel: '#B7B7CE',
        fairy: '#D685AD',
    },
    height: function(decimeters) {
        const feet = Math.floor(decimeters * 0.328084);
        const inches = Math.round((decimeters * 0.328084 - feet) * 12);
        return `${feet}'${inches}"`;
    },
    weight: function(hectograms) {
        const pounds = hectograms * 0.220462;
        const roundedPounds = pounds.toFixed(2);
    
        return roundedPounds;
    },
    clearState : function() {
        var urlWithoutParams = window.location.origin + window.location.pathname;
        history.replaceState({}, document.title, urlWithoutParams);
    },
    generateRandom : function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
}

export const globalConstants = {
    
}