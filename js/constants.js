export const fns = {
    getPokemon: async function getPokemon(name) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch Pokémon data for ${name}`);
            }
            return response.json();
        } catch (error) {
            console.error(error);
            return null; // Return null to indicate that no data was fetched
        }
    }, 
    getPokemonAll: async function getPokemonAll(url) {
        const response = await fetch(url);
        return response.json();
    },
    getPokemonDesc: async function getPokemonDesc(name) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`);
        return response.json();
    },
    toTitleCase: function toTitleCase(str) {
        return str.toLowerCase().replace(/\b\w/g, function (match) {
            return match.toUpperCase();
        });
    },
    getPokemonLoc: async function getPokemonLoc(id) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/encounters`)
        const pokemon = await response.json()
        return pokemon
    },
    getPokemonEvolutionChain: async function getPokemonEvolutionChain(url) {
        const response = await fetch(url)
        const pokemon = await response.json()
        return pokemon
    }
}