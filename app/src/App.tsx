import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import Arena from "./game/Arena";

export default function App() {
  const [config, setConfig] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    fetch("/config.csv")
      .then((r) => r.text())
      .then((text) => {
        const lines = text.trim().split("\n").slice(1);
        const map = new Map<string, string>();
        for (const line of lines) {
          const [key, ...rest] = line.split(",");
          map.set(key.trim(), rest.join(",").trim());
        }
        setConfig(map);
      });
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* LAYER 1: 3D Background (WebGL Canvas) */}
      <Canvas
        camera={{ position: [0, 10, 15], fov: 50 }}
        className="absolute inset-0"
        shadows
      >
        <Arena />
      </Canvas>

      {/* LAYER 2: 2D UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="app-screen flex flex-col items-center justify-center gap-6 h-full">
          {/* Logo */}
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg pointer-events-auto">
            <span className="text-white text-4xl font-bold">BA</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold ink-strong">
            {config.get("app_name") || "Loading..."}
          </h1>

          {/* Version */}
          <p className="text-sm ink-soft">v0.1.0 - Phase 1: 3D Scene</p>

          {/* Start button */}
          <button className="ui-cta mt-4 pointer-events-auto">Start</button>
        </div>
      </div>
    </div>
  );
}
