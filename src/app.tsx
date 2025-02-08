import { Outlet } from "react-router";

const App = () => {
  return (
    <div className="flex flex-col w-screen h-full justify-center">
      <Outlet />
    </div>
  );
};

export default App;
