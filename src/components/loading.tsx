import { Html } from "@react-three/drei";
import MorphingText from "./ui/morphing-text";

export function Loading() {
  const texts = [
    "Preparando Pokébolas",
    "Carregando Pokémon...",
    "Conectando ao Professor Oak",
    "Explorando a região...",
    "Capturando dados selvagens!",
    "Alinhando Pokédex...",
    "Atualizando PokéMapas",
    "Treinador, prepare-se!",
    "Escaneando Pokémon próximos",
    "Vai, Pokédex!",
  ];

  return (
    <div className="flex flex-col items-center justify-center size-full">
      <img
        title="pokeball"
        src="pokeball.png"
        className="size-24 animate-bounce"
      />
    
    </div>
  );
}
