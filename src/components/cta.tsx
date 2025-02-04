import SparklesText from "./ui/sparkles-text";
import { RainbowButton } from "./ui/rainbow-button";
import { Link } from "react-router";

const Cta = () => {

  return (
    <div className="flex items-center justify-center p-4 mt-16">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="font-michroma font-bold mb-6 leading-tight text-foreground md:text-6xl text-3xl pointer-events-none">
          Explore pokémons
          <SparklesText
            className="md:text-6xl text-3xl"
            text="como Nunca Visto Antes"
            colors={{ first: "#ff0000", second: "#fff" }}
          />
        </h1>

        <div className="flex flex-col items-center">
          <p className="text-sm leading-5 mb-8 max-w-2xl mx-auto font-sora opacity-70 pointer-events-none">
            Mergulhe em um mundo único onde seus Pokémon favoritos ganham vida
            em 3D. Uma experiência visual revolucionária que vai transformar sua
            forma de ver o universo Pokémon.
          </p>
          <Link to="pokemons" className="pointer-events-auto">
            <RainbowButton className="z-[90]">Ver Pokémons</RainbowButton>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cta;
