/**
 * useTechTree - Manages tech tree unlocking based on buildings
 *
 * Filters available cards based on what buildings the team has built.
 * Cards only appear in deck if prerequisites are met.
 */

import { useEffect } from "react";
import { useGameState } from "../engine/GameState";
import { Card, TechTreeEntry } from "../data/loadData";

interface UseTechTreeProps {
  team: "player" | "cpu";
  allCards: Card[];
  techTree: TechTreeEntry[];
}

export function useTechTree({ team, allCards, techTree }: UseTechTreeProps) {
  const { state } = useGameState();

  /**
   * Get available cards based on current buildings.
   * A card is available if:
   * - It has no tech requirement (required_building = "none"), OR
   * - The team has built the required building
   */
  const getAvailableCards = (): Card[] => {
    // Get all buildings owned by this team
    const teamBuildings = state.buildings.filter(b => b.team === team);
    const builtBuildingTypes = new Set(teamBuildings.map(b => b.buildingType));

    return allCards.filter(card => {
      // Find tech requirement for this card
      const techRequirement = techTree.find(t => t.card_id === card.id);

      // If no tech requirement exists, card is always available
      if (!techRequirement) return true;

      // If requirement is "none", always available
      if (techRequirement.required_building === "none") return true;

      // Check if required building has been built
      return builtBuildingTypes.has(techRequirement.required_building);
    });
  };

  return {
    getAvailableCards,
  };
}
