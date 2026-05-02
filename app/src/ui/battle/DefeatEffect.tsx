/**
 * DefeatEffect - Defeat visual effects
 */

import CanvasParticles from "./CanvasParticles";

export default function DefeatEffect() {
  return (
    <>
      {/* Ash/ember particles */}
      <CanvasParticles type="ash" />

      {/* Darkened overlay */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Subtle red pulse */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-900/20 rounded-full blur-3xl animate-pulse" />
      </div>
    </>
  );
}
