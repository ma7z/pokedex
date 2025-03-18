import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  type FormEvent,
} from "react";
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
import { Link, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Box3, Vector3, Group, Material, Mesh } from "three";
import { HomeIcon, Loader, SearchIcon } from "lucide-react";
import { InfoCircledIcon, ReloadIcon } from "@radix-ui/react-icons";
import { Dialog, DialogContent, DialogTrigger } from "./components/ui/dialog";
import axios from "axios";
import PokemonDetails from "./pokemondetails";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { AuroraText } from "./components/magicui/aurora-text";

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

const ITEMS_PER_PAGE = 8;

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
      "https://pokemon3d-api.onrender.com/v1/regular"
    );
    console.log(response)

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
    return (
      <Html
        center
        style={{ position: "relative" }}
        className="z-[-10] text-center w-[20rem] flex flex-col items-center justify-center"
      >
        <div className="z-[10] text-center relative font-michroma">
          Infelizmente o modelo deste pokémon não existe ou não foi encontrado.
        </div>
      </Html>
    );
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
  const searchQuery = searchParams.get("search") || "";

  const [filteredPokemon, setFilteredPokemon] = useState<PokemonData[]>([]);

  const { data, isLoading, error } = useQuery<PokemonList>({
    queryKey: ["allPokemon"],
    queryFn: async () => {
      const response = await axios.get(
        "https://pokemon3d-api.onrender.com/v1/regular"
      );
      return {
        pokemon: response.data[0].pokemon,
        totalCount: response.data[0].pokemon.length,
      };
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data?.pokemon && searchQuery) {
      const filtered = data.pokemon.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPokemon(filtered);
      if (currentPage !== 1) {
        setSearchParams({ search: searchQuery, page: "1" });
      }
    } else {
      setFilteredPokemon(data?.pokemon || []);
    }
  }, [searchQuery, data?.pokemon, setSearchParams]);

  const totalPages = Math.ceil((filteredPokemon?.length || 0) / ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      fetchPokemonData({ page: nextPage });
    }
  }, [currentPage, totalPages]);

  const paginatedPokemon = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredPokemon.slice(start, end);
  }, [currentPage, filteredPokemon]);

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      search: "",
      page: newPage.toString(),
    });
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const searchValue = (
      form.elements.namedItem("pokeSearch") as HTMLInputElement
    ).value;

    if (searchValue === "" && searchQuery) {
      setSearchParams({
        page: "1",
      });
    }
    if (searchValue) {
      setSearchParams({
        ...{ search: searchValue },
        page: "1",
      });
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
    <div className="flex flex-col bg-background">
      <div className="flex items-center justify-between px-1">
        <div className="w-1/2 fixed bottom-8 mb-auto mx-auto inset-x-0 z-[999]">
          <Pagination className="size-fit bg-background/70 backdrop-blur-lg rounded-full border">
            <PaginationContent>
              <PaginationItem className="rounded-full">
                <PaginationPrevious
                  aria-disabled={searchQuery.length <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50 rounded-full"
                      : "rounded-full cursor-pointer"
                  }
                />
              </PaginationItem>
              {getPageNumbers().map((pageNum, idx) => (
                <PaginationItem className="rounded-full" key={idx}>
                  {pageNum === -1 ? (
                    <PaginationEllipsis className="rounded-full" />
                  ) : (
                    <PaginationLink
                      aria-disabled={searchQuery.length <= 1}
                      onClick={() => handlePageChange(pageNum)}
                      className={`cursor-pointer rounded-full ${
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-1 px-8 max-w-screen overflow-hidden">
        {paginatedPokemon.length >= 1 ? (
          paginatedPokemon.map((pokemon) => (
            <div
              key={pokemon.id}
              className="w-full aspect-square sm:aspect-[2rem] md:aspect-[29.5rem] lg:aspect-[35rem] border-foreground/10 border rounded-md"
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
                        <DialogContent className="sm:max-w-[425px] p-0">
                          <PokemonDetails id={pokemon.id} />
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </div>

              <Canvas
                className="flex items-center justify-center"
                camera={{ fov: 70 }}
                gl={{}}
              >
                <AmbientLights />
                <OrbitControls
                  maxDistance={0}
                  minDistance={2}
                  enablePan={false}
                  enableZoom={true}
                />

                <ModelErrorBoundary>
                  <PokemonDisplay {...pokemon} />
                </ModelErrorBoundary>
              </Canvas>
            </div>
          ))
        ) : (
          <div className="w-full h-screen">
            <div className="flex flex-col m-auto inset-0 size-fit items-center justify-center absolute gap-y-16">
              <img
                src="pokeball.svg"
                alt=""
                className="size-48 aspect-square animate-bounce"
              />
              <h1 className="text-3xl font-bold max-w-3xl text-center font-michroma">
                OPSS, Nenhum Pokemon foi encontrado com esse nome "
                <AuroraText>{searchQuery}</AuroraText>''
              </h1>
              <Link to="/pokemons">
                <Button variant="outline">
                  <ReloadIcon />
                  Tentar novamente
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
      <div className="flex size-fit items-center mx-auto bg-background absolute backdrop-blur-xl inset-x-0 top-8 gap-x-1 rounded-full">
        <Link to={"/"}>
          <Button className="rounded-full" variant="outline">
            <HomeIcon />
          </Button>
        </Link>
        <form onSubmit={handleSearch} className="flex items-center gap-x-1">
          <Input
            className="rounded-full"
            placeholder="Pesquisar"
            type="search"
            name="pokeSearch"
          />
          <Button className="rounded-full" variant="outline" type="submit">
            <SearchIcon />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Pokemons;
