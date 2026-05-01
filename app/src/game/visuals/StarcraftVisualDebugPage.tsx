/**
 * StarcraftVisualDebugPage - Interactive model viewer for prototyping
 *
 * Allows testing all models with different states, colors, and animations.
 */

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { StarcraftModel, ModelName, FactionModelShowcase } from "./StarcraftPrototypeModels";
import { getFactionColor, UNIT_VISUALS, BUILDING_VISUALS, UnitId, BuildingId } from "./starcraftVisualConfig";

type ViewMode = "single" | "showcase";

export default function StarcraftVisualDebugPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [selectedModel, setSelectedModel] = useState<ModelName>("TerranMarine");
  const [isMoving, setIsMoving] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [teamColor, setTeamColor] = useState("#4a9eff");
  const [modelScale, setModelScale] = useState(1.0);
  const [rotationY, setRotationY] = useState(0);

  // Check if selected model can attack
  const canAttack = (() => {
    // Map model name to unit/building ID
    const modelToId: Record<string, string> = {
      "TerranMarine": "terran_marine",
      "TerranFirebat": "terran_firebat",
      "TerranBunker": "terran_bunker",
      "ZergLarva": "zerg_larva",
      "ZergCocoon": "zerg_cocoon",
      "Zergling": "zerg_zergling",
      "Hydralisk": "zerg_hydralisk",
      "ZergSunkenColony": "zerg_sunken_colony",
      "ProtossZealot": "protoss_zealot",
      "ProtossDragoon": "protoss_dragoon",
      "ProtossPhotonCannon": "protoss_photon_cannon",
    };

    const id = modelToId[selectedModel];
    if (!id) return false;

    // Check if it's a unit with attack VFX
    if (id in UNIT_VISUALS) {
      return UNIT_VISUALS[id as UnitId].attackVfx !== undefined;
    }

    // Check if it's a building that can attack
    if (id in BUILDING_VISUALS) {
      return BUILDING_VISUALS[id as BuildingId].canAttack;
    }

    return false;
  })();

  const allModels: ModelName[] = [
    "TerranMarine",
    "TerranFirebat",
    "TerranCommandCenter",
    "TerranBarracks",
    "TerranBunker",
    "ZergLarva",
    "ZergCocoon",
    "Zergling",
    "Hydralisk",
    "ZergHatchery",
    "ZergSpawningPool",
    "ZergCreepColony",
    "ZergSunkenColony",
    "ProtossZealot",
    "ProtossDragoon",
    "ProtossNexus",
    "ProtossGateway",
    "ProtossPhotonCannon",
  ];

  const presetColors = [
    { name: "Terran Blue", color: "#4a9eff" },
    { name: "Zerg Purple", color: "#9b59b6" },
    { name: "Protoss Gold", color: "#f1c40f" },
    { name: "Red Team", color: "#e74c3c" },
    { name: "Green Team", color: "#2ecc71" },
  ];

  return (
    <div className="w-full h-screen flex">
      {/* Left Panel - Controls */}
      <div className="w-80 bg-gray-900 text-white p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Model Viewer</h1>
          <a
            href="#game"
            className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors"
          >
            ← Back to Game
          </a>
        </div>

        {/* View Mode */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">View Mode</label>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("single")}
              className={`flex-1 px-4 py-2 rounded ${
                viewMode === "single" ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              Single
            </button>
            <button
              onClick={() => setViewMode("showcase")}
              className={`flex-1 px-4 py-2 rounded ${
                viewMode === "showcase" ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              Showcase
            </button>
          </div>
        </div>

        {viewMode === "single" && (
          <>
            {/* Model Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as ModelName)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
              >
                <optgroup label="Terran">
                  <option value="TerranMarine">Marine</option>
                  <option value="TerranFirebat">Firebat</option>
                  <option value="TerranCommandCenter">Command Center</option>
                  <option value="TerranBarracks">Barracks</option>
                  <option value="TerranBunker">Bunker</option>
                </optgroup>
                <optgroup label="Zerg">
                  <option value="ZergLarva">Larva</option>
                  <option value="ZergCocoon">Cocoon</option>
                  <option value="Zergling">Zergling</option>
                  <option value="Hydralisk">Hydralisk</option>
                  <option value="ZergHatchery">Hatchery</option>
                  <option value="ZergSpawningPool">Spawning Pool</option>
                  <option value="ZergCreepColony">Creep Colony</option>
                  <option value="ZergSunkenColony">Sunken Colony</option>
                </optgroup>
                <optgroup label="Protoss">
                  <option value="ProtossZealot">Zealot</option>
                  <option value="ProtossDragoon">Dragoon</option>
                  <option value="ProtossNexus">Nexus</option>
                  <option value="ProtossGateway">Gateway</option>
                  <option value="ProtossPhotonCannon">Photon Cannon</option>
                </optgroup>
              </select>
            </div>

            {/* State Toggles */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Animation State</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isMoving}
                    onChange={(e) => setIsMoving(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Moving</span>
                </label>
                <label className={`flex items-center gap-2 ${!canAttack ? 'opacity-50' : ''}`}>
                  <input
                    type="checkbox"
                    checked={isAttacking}
                    onChange={(e) => setIsAttacking(e.target.checked)}
                    disabled={!canAttack}
                    className="w-4 h-4"
                  />
                  <span>Attacking {!canAttack && "(N/A)"}</span>
                </label>
              </div>
            </div>

            {/* Team Color */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Team Color</label>
              <div className="space-y-2">
                {presetColors.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setTeamColor(preset.color)}
                    className={`w-full px-3 py-2 rounded flex items-center gap-2 ${
                      teamColor === preset.color ? "bg-gray-700" : "bg-gray-800"
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded border border-gray-600"
                      style={{ backgroundColor: preset.color }}
                    />
                    <span>{preset.name}</span>
                  </button>
                ))}
                <input
                  type="color"
                  value={teamColor}
                  onChange={(e) => setTeamColor(e.target.value)}
                  className="w-full h-10 bg-gray-800 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Scale */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Scale: {modelScale.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={modelScale}
                onChange={(e) => setModelScale(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Rotation */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Rotation: {Math.round((rotationY * 180) / Math.PI)}°
              </label>
              <input
                type="range"
                min="0"
                max={Math.PI * 2}
                step="0.1"
                value={rotationY}
                onChange={(e) => setRotationY(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setIsMoving(false);
                setIsAttacking(false);
                setTeamColor("#4a9eff");
                setModelScale(1.0);
                setRotationY(0);
              }}
              className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
            >
              Reset All
            </button>
          </>
        )}

        {viewMode === "showcase" && (
          <div className="text-sm text-gray-400">
            <p className="mb-2">Showing all models in rows by faction:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Top row: Terran</li>
              <li>Middle row: Zerg</li>
              <li>Bottom row: Protoss</li>
            </ul>
          </div>
        )}
      </div>

      {/* Right Panel - 3D Canvas */}
      <div className="flex-1 bg-gray-800">
        <Canvas
          camera={{ position: [8, 10, 8], fov: 50 }}
          shadows
        >
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />

          {/* Grid */}
          <Grid
            args={[20, 20]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#444444"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#666666"
            fadeDistance={30}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid={false}
          />

          {/* Models */}
          {viewMode === "single" ? (
            <StarcraftModel
              model={selectedModel}
              position={[0, 0, 0]}
              rotation={[0, rotationY, 0]}
              scale={modelScale}
              teamColor={teamColor}
              isMoving={isMoving}
              isAttacking={isAttacking}
            />
          ) : (
            <FactionModelShowcase />
          )}

          {/* Camera Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={30}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
    </div>
  );
}
