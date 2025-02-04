import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import React, { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Box3, Vector3, Group, Material, Mesh } from "three";
import { Loader } from "lucide-react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Dialog, DialogContent, DialogTrigger } from "./components/ui/dialog";
import axios from "axios";
import PokemonDetails from "./pokemondetails";

interface PokemonData {
  id: number;
  name: string;
  model: string;
}

interface PokemonList {
  pokemon: PokemonData[];
  totalCount: number;
}

interface FetchPokemonOptions {
  page: number;
}

const pokemonCache: Record<number, PokemonData[]> = {};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

interface PokemonDisplayProps extends PokemonData {}

const ITEMS_PER_PAGE = 12;

const fetchPokemonData = async ({
  page,
}: FetchPokemonOptions): Promise<PokemonList> => {
  if (pokemonCache[page]) {
    return {
      pokemon: pokemonCache[page],
      totalCount: 1025,
    };
  }

  try {
    const response = await axios.get(
      "https://raw.githubusercontent.com/Sudhanshu-Ambastha/Poke-3D-Models-Api/main/PokeData.json"
    );

    const allData = response.data;
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageData = allData.pokemon.slice(start, end);

    pokemonCache[page] = pageData;

    return {
      pokemon: pageData,
      totalCount: allData.pokemon.length,
    };
  } catch (error) {
    throw new Error("Falha ao buscar os pokémons...");
  }
};

export const ModelErrorBoundary: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [hasError, setHasError] = useState<boolean>(false);

  if (hasError) {
    return <group></group>;
  }

  return (
    <group>
      <ErrorBoundary onError={() => setHasError(true)}>
        {children}
      </ErrorBoundary>
    </group>
  );
};

export const PokemonDisplay: React.FC<PokemonDisplayProps> = ({ model }) => {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(model);
  const { camera } = useThree();

  useEffect(() => {
    if (scene && groupRef.current) {
      const box = new Box3().setFromObject(scene);
      const size = new Vector3();
      box.getSize(size);

      const maxDimension = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDimension;

      groupRef.current.scale.setScalar(scale);

      const center = new Vector3();
      box.getCenter(center);
      groupRef.current.position.set(
        -center.x * scale,
        -center.y * scale,
        -center.z * scale
      );

      const distance = maxDimension * 1.5;
      camera.position.set(0, 0, distance);
      camera.updateProjectionMatrix();
    }

    return () => {
      scene.traverse((object) => {
        if (object instanceof Mesh) {
          if (object.geometry) {
            object.geometry.dispose();
          }

          if (object.material instanceof Material) {
            object.material.dispose();
          } else if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          }
        }
      });
    };
  }, [scene, camera]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
};

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo): void {
    this.props.onError();
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

export const AmbientLights = () => {
  return (
    <>
      <ambientLight intensity={0.8} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[2, 3, 5]} intensity={0.8} />
      <directionalLight position={[-1, -1, -1]} intensity={0.9} />
    </>
  );
};

export const Pokemons: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const { data, isLoading, error } = useQuery<PokemonList>({
    queryKey: ["pokemon", currentPage],
    queryFn: () => fetchPokemonData({ page: currentPage }),
    staleTime: Infinity,
  });

  const [isChangingPage, setIsChangingPage] = useState(false);
  const totalPages = data ? Math.ceil(1025 / ITEMS_PER_PAGE) : 0;

  useEffect(() => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      fetchPokemonData({ page: nextPage });
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (newPage: number): void => {
    if (isChangingPage) return;

    if (newPage >= 1 && newPage <= totalPages) {
      setIsChangingPage(true);
      setSearchParams({ page: newPage.toString() });

      setTimeout(() => {
        setIsChangingPage(false);
      }, 1000);
    }
  };
  const getPageNumbers = (): Array<number> => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (isLoading) {
    const skeletons = Array.from({ length: 12 });

    return (
      <div className="flex flex-col mt-36">
        <div className="flex flex-wrap justify-center items-center gap-1 overflow-hidden">
          {skeletons.map((_, index) => (
            <Skeleton
              key={index}
              className="w-full md:size-[19.3rem] rounded-md"
            />
          ))}
        </div>

        <Pagination className="my-8 overflow-x-hidden">
          <PaginationContent>
            <PaginationItem className="cursor-not-allowed ">
              <PaginationPrevious />
            </PaginationItem>
            <Loader className="animate-spin" />
            <PaginationItem>
              <PaginationNext />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen w-full overflow-hidden mt-36">
        <p className="text-lg text-red-500">Erro ao carregar os Pokémons</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-background w-full overflow-x-hidden mt-36">
      <div className="flex flex-wrap gap-1 justify-center">
        {data?.pokemon?.map((pokemon) => (
          <div
            key={pokemon.id}
            className="w-full md:size-[19.3rem] border-foreground/10 border rounded-md"
          >
            <div className="flex size-fit px-1 rounded-xl items-center absolute">
              <div className="flex gap-x-1">
                <h1 className="font-michroma text-md md:text-lg pointer-events-none select-none">
                  {pokemon.name}
                </h1>
                <div className="flex rounded-2xl p-2 gap-x-2 items-center cursor-pointer z-[10]">
                  {pokemon.id && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <InfoCircledIcon className="size-3 md:size-5 hover:scale-110 duration-300" />
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] p-0 z-[999]">
                        <PokemonDetails id={pokemon.id} />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </div>

            <Canvas
              className="flex items-center justify-center"
              camera={{ fov: 80 }}
              gl={{
                powerPreference: "high-performance",
                antialias: false,
                failIfMajorPerformanceCaveat: true,
                preserveDrawingBuffer: false,
              }}
            >
              <AmbientLights />
              <OrbitControls
                maxDistance={0}
                minDistance={2}
                enablePan={false}
                enableZoom={false}
              />

              <ModelErrorBoundary>
                <PokemonDisplay {...pokemon} />
              </ModelErrorBoundary>
            </Canvas>
          </div>
        ))}
      </div>

      <Pagination className="my-8 overflow-x-hidden">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(currentPage - 1)}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
          {getPageNumbers().map((pageNum, idx) => (
            <PaginationItem key={idx}>
              {pageNum === -1 ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => handlePageChange(pageNum)}
                  className={`cursor-pointer ${
                    pageNum === currentPage
                      ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                      : ""
                  }`}
                >
                  {pageNum}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(currentPage + 1)}
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default Pokemons;
