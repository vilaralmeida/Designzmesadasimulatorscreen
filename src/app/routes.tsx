import { createBrowserRouter } from "react-router";
import RootLayout from "./pages/RootLayout";
import Home from "./pages/Home";
import Story from "./pages/Story";
import Stats from "./pages/Stats";
import Donate from "./pages/Donate";
import Tips from "./pages/Tips";

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
      // { path: "*", Component: NotFound },
    ],
  },
]);
