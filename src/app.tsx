import { Navbar } from "./components/navbar";
import { Outlet } from "react-router";

const App = () => {
  return (
    <div className="flex flex-col w-screen h-full justify-center">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default App;
