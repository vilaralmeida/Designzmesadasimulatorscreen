import { createBrowserRouter } from "react-router";
import RootLayout from "./pages/RootLayout";
import Home from "./pages/Home";
import Story from "./pages/Story";
import Stats from "./pages/Stats";
import Donate from "./pages/Donate";
import Tips from "./pages/Tips";
import Admin from "./pages/Admin";
import Ranking from "./pages/Ranking";
import Login from "./pages/Login";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "historia", Component: Story },
      { path: "stats", Component: Stats },
      { path: "ajuda", Component: Donate },
      { path: "dicas", Component: Tips },
      { path: "ranking", Component: Ranking },
      { path: "login", Component: Login },
    ],
  },
  // Admin fora do RootLayout (sem bottom bar, tela própria)
  { path: "/admin", Component: Admin },
]);
