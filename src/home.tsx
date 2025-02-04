import { Canvas } from "@react-three/fiber";
import Cta from "./components/cta";
import { WarpBackground } from "./components/ui/warp-background";
import { AmbientLights, PokemonDisplay } from "./pokemons";
import { OrbitControls } from "@react-three/drei";
import { Mouse } from "lucide-react";

const ScrollInstructions = () => {
  return (
    <div className="absolute mx-auto inset-x-0 mt-8 *:z-90 flex flex-col items-center">
      <div className="flex items-center bg-background/5 backdrop-blur-md rounded-lg px-4 py-2">
        <Mouse className="mr-2" size={16} />
        <span className="text-xs font-michroma pointer-events-none">
          Role para zoom | Clique e arraste para girar
        </span>
      </div>
    </div>
  );
};

export const Home = () => {
  return (
    <div className="max-w-screen h-screen relative">
      <WarpBackground className="flex flex-col size-full overflow-hidden">
        <div className="absolute inset-0 flex items-start justify-center z-50">
          <div className="w-screen h-screen">
            <Canvas
              className="w-screen h-screen z-80 bg-transparent mt-8"
              camera={{ fov: 5 }}
              gl={{
                powerPreference: "high-performance",
                antialias: false,
                failIfMajorPerformanceCaveat: true,
                preserveDrawingBuffer: false,
              }}
            >
              <AmbientLights />
              <OrbitControls enablePan={false} maxZoom={0.8} />
              <PokemonDisplay
                id={928}
                name="Smoliv"
                model="https://raw.githubusercontent.com/Sudhanshu-Ambastha/Poke-3D-Models-Api/main/models/regular/928.glb"
              />
            </Canvas>
          </div>
        </div>
        <ScrollInstructions />
        <Cta />
      </WarpBackground>
    </div>
  );
};
