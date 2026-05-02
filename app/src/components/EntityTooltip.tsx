/**
 * EntityTooltip - Tooltip for tapped units/buildings
 *
 * Shows entity info and actions (demolish for owned buildings)
 */

import { Unit, PlacedBuilding } from "../engine/GameState";
import { UnitStats, Building } from "../data/loadData";

interface Props {
  entity: { type: "unit"; data: Unit; stats: UnitStats } | { type: "building"; data: PlacedBuilding; stats: Building };
  position: { x: number; y: number };
  onClose: () => void;
  onDemolish?: () => void;
  isOwned: boolean;
}

export default function EntityTooltip({ entity, position, onClose, onDemolish, isOwned }: Props) {
  const isUnit = entity.type === "unit";
  const name = isUnit ? entity.stats.faction.charAt(0).toUpperCase() + entity.stats.faction.slice(1) + " " + entity.data.unitType.replace(/_unit$/, '').replace(/_/g, ' ') : entity.stats.name;

  // Get description
  const description = isUnit
    ? `${entity.stats.faction.charAt(0).toUpperCase() + entity.stats.faction.slice(1)} unit - ${entity.stats.damage} damage, ${entity.stats.attack_range} range`
    : entity.stats.description;

  // Position tooltip to not cover entity
  // If entity is in top half, show tooltip below; otherwise show above
  const isTopHalf = position.y < window.innerHeight / 2;
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${Math.min(Math.max(position.x - 100, 10), window.innerWidth - 210)}px`,
    [isTopHalf ? 'top' : 'bottom']: isTopHalf ? `${position.y + 20}px` : `${window.innerHeight - position.y + 20}px`,
    zIndex: 100000,
  };

  return (
    <div
      className="pointer-events-auto bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl max-w-[200px]"
      style={tooltipStyle}
      onClick={onClose}
    >
      {/* Title */}
      <div className="text-white font-semibold text-sm mb-1 capitalize">
        {name}
      </div>

      {/* Description */}
      <div className="text-gray-300 text-xs mb-2">
        {description}
      </div>

      {/* Stats */}
      <div className="text-gray-400 text-xs mb-2">
        {isUnit ? (
          <>
            HP: {Math.ceil(entity.data.health)}/{entity.stats.health}
            {entity.stats.max_shields > 0 && (
              <> | Shield: {Math.ceil(entity.data.shields || 0)}/{entity.stats.max_shields}</>
            )}
          </>
        ) : (
          <>
            HP: {Math.ceil(entity.data.health)}/{entity.stats.health}
            {entity.stats.max_shields > 0 && (
              <> | Shield: {Math.ceil(entity.data.shields || 0)}/{entity.stats.max_shields}</>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      {!isUnit && isOwned && onDemolish && (
        <button
          className="w-full bg-red-600 hover:bg-red-700 text-white text-xs py-1.5 px-2 rounded transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onDemolish();
          }}
        >
          Demolish
        </button>
      )}

      {/* Tap to close hint */}
      <div className="text-gray-500 text-xs text-center mt-2 italic">
        Tap to close
      </div>
    </div>
  );
}
