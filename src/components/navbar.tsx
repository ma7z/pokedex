import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { NavLink } from "react-router";

export function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex w-1/2 mx-auto absolute h-16 pl-4 pr-8 inset-x-0 items-center border border-foreground/10 rounded-full justify-between mt-5 top-3 backdrop-blur-lg bg-background/30 z-[50]">
      <NavLink
        to="/"
        className="flex justify-center items-center gap-x-2 px-3 py-1 rounded-md"
      >
        <img
          src="pokeball.svg"
          alt=""
          className="min-h-8 min-w-8 size-8 aspect-square"
        />
      </NavLink>
      <div className="flex mr-0 left-0 z-[999] items-center gap-x-1">
        <NavLink
          to="/pokemons"
          className="flex justify-center items-center gap-x-2 px-3 py-1 rounded-md"
        >
          <Button
            variant="outline"
            className="disabled:cursor-not-allowed select-none rounded-full"
          >
            Pokémons
          </Button>
        </NavLink>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={theme === "light"}
              onCheckedChange={() => setTheme("light")}
            >
              Light
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={theme === "dark"}
              onCheckedChange={() => setTheme("dark")}
            >
              Dark
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={theme === "system"}
              onCheckedChange={() => setTheme("system")}
            >
              System
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
