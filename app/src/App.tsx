/**
 * App - Entry point
 *
 * Routes:
 * - / or /#game - Main game
 * - /#debug - Model debug viewer
 */

import { useEffect, useState } from "react";
import GameContainer from "./GameContainer";
import StarcraftVisualDebugPage from "./game/visuals/StarcraftVisualDebugPage";

export default function App() {
  const [route, setRoute] = useState(window.location.hash || "#game");

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || "#game");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (route === "#debug") {
    return <StarcraftVisualDebugPage />;
  }

  return <GameContainer />;
}
