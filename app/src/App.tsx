import { useState, useEffect } from "react";

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
    <div className="app-screen flex flex-col items-center justify-center gap-6">
      {/* Replace with your logo: drop an image in data/sprites/logo.png */}
      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
        <span className="text-white text-4xl font-bold">BA</span>
      </div>
      <h1 className="text-2xl font-bold ink-strong">
        {config.get("app_name") || "Loading..."}
      </h1>
      <p className="text-sm ink-soft">v0.1.0</p>
      <button className="ui-cta mt-4">Start</button>
    </div>
  );
}
