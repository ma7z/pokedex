import { createRoot } from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Home } from "./home.tsx";
import { Pokemons } from "./pokemons.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./app.tsx";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/pokemons",
        element: <Pokemons />,
      },
    ],
  },
]);
createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" storageKey="chat-ui-theme">
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </ThemeProvider>
);
