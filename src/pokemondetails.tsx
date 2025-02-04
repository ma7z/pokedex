import React from "react";
import axios from "axios";
import { useQuery, QueryFunctionContext } from "@tanstack/react-query";
import { Loading } from "./components/loading";

const typeTranslations: Record<string, string> = {
  normal: "Normal",
  fighting: "Lutador",
  flying: "Voador",
  poison: "Venenoso",
  ground: "Terra",
  rock: "Pedra",
  bug: "Inseto",
  ghost: "Fantasma",
  steel: "Aço",
  fire: "Fogo",
  water: "Água",
  grass: "Planta",
  electric: "Elétrico",
  psychic: "Psíquico",
  ice: "Gelo",
  dragon: "Dragão",
  dark: "Sombrio",
  fairy: "Fada",
};

const statTranslations: Record<string, string> = {
  hp: "HP",
  attack: "Ataque",
  defense: "Defesa",
  "special-attack": "Ataque Especial",
  "special-defense": "Defesa Especial",
  speed: "Velocidade",
};

const typeColors: Record<string, string> = {
  normal: "bg-neutral-400 dark:bg-neutral-500",
  fighting: "bg-red-600 dark:bg-red-700",
  flying: "bg-blue-400 dark:bg-blue-500",
  poison: "bg-purple-500 dark:bg-purple-600",
  ground: "bg-yellow-600 dark:bg-yellow-700",
  rock: "bg-yellow-700 dark:bg-yellow-800",
  bug: "bg-green-500 dark:bg-green-600",
  ghost: "bg-purple-600 dark:bg-purple-700",
  steel: "bg-neutral-500 dark:bg-neutral-600",
  fire: "bg-red-500 dark:bg-red-600",
  water: "bg-blue-500 dark:bg-blue-600",
  grass: "bg-green-600 dark:bg-green-700",
  electric: "bg-yellow-400 dark:bg-yellow-500",
  psychic: "bg-pink-500 dark:bg-pink-600",
  ice: "bg-blue-300 dark:bg-blue-400",
  dragon: "bg-purple-600 dark:bg-purple-700",
  dark: "bg-neutral-700 dark:bg-neutral-800",
  fairy: "bg-pink-400 dark:bg-pink-500",
};

interface Pokemon {
  id: number;
  name: string;
  abilities: { ability: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  types: { type: { name: string } }[];
  sprites: {
    front_default: string;
    other?: {
      "official-artwork"?: { front_default: string };
    };
  };
}

const fetchPokemon = async ({
  queryKey,
}: QueryFunctionContext): Promise<Pokemon> => {
  const [, id] = queryKey;
  const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);

  return data;
};

interface PokemonDetailsProps {
  id: number;
}

const PokemonDetails: React.FC<PokemonDetailsProps> = ({ id }) => {
  const {
    data: pokemon,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pokemon", id],
    queryFn: fetchPokemon,
  });

  if (isLoading) return <Loading />;
  if (error)
    return (
      <div className="text-center text-red-500 dark:text-red-400 p-4">
        Erro ao carregar o Pokémon: {(error as Error).message}
      </div>
    );

  return (
    <div className="w-full mx-auto font-michroma bg-white dark:bg-neutral-800 rounded-xl overflow-hidden transition-colors">
      {pokemon && (
        <>
          <div className="bg-neutral-100 dark:bg-neutral-700 p-6 text-center  z-[999]">
            <h1  className="text-3xl font-bold text-neutral-800 dark:text-white mb-4 capitalize">
              {pokemon?.name?.split("-").join(" ")}
            </h1>
            <img
              loading="lazy"
              className="w-48 h-48 mx-auto object-contain"
              src={
                pokemon?.sprites?.other?.["official-artwork"]?.front_default ||
                pokemon?.sprites?.front_default
              }
              alt={pokemon.name}
            />
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-2">
                Tipos
              </h3>
              <div className="flex gap-2 flex-wrap">
                {pokemon?.types?.map((type, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-white text-sm ${
                      typeColors[type.type.name]
                    }`}
                  >
                    {typeTranslations[type.type.name] || type.type.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-2">
                Habilidades
              </h3>
              <div className="space-y-1">
                {pokemon?.abilities?.map((ability, index) => (
                  <div
                    key={index}
                    className="bg-neutral-100 dark:bg-neutral-700 px-3 py-2 rounded-lg text-neutral-700 dark:text-neutral-200"
                  >
                    {ability.ability.name
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-2">
                Status
              </h3>
              <div className="space-y-2">
                {pokemon?.stats?.map((stat, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-32 text-neutral-600 dark:text-neutral-300">
                      {statTranslations[stat.stat.name] || stat.stat.name}:
                    </span>
                    <div className="flex-1 h-4 bg-neutral-200 dark:bg-neutral-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-500"
                        style={{ width: `${(stat.base_stat / 255) * 100}%` }}
                      />
                    </div>
                    <span className="ml-2 text-neutral-600 dark:text-neutral-300 w-8">
                      {stat.base_stat}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PokemonDetails;
