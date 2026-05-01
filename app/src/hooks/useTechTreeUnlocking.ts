/**
 * useTechTreeUnlocking - Watches for new buildings and unlocks cards
 *
 * When a building is placed, checks what cards are newly available
 * and adds them to the deck.
 */

import { useEffect, useRef } from "react";
import { useGameState } from "../engine/GameState";
import { Card, TechTreeEntry } from "../data/loadData";

interface Props {
  allCards: Card[];
  techTree: TechTreeEntry[];
}

export function useTechTreeUnlocking({ allCards, techTree }: Props) {
  const { state, actions } = useGameState();

  // Track which buildings we've already processed to avoid duplicate unlocks
  const processedBuildings = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (state.phase !== "playing") return;

    // Check each building
    state.buildings.forEach(building => {
      // Skip if already processed
      if (processedBuildings.current.has(building.id)) return;

      // Mark as processed
      processedBuildings.current.add(building.id);

      // Find cards that are unlocked by this building
      const unlockedCards = allCards.filter(card => {
        const techReq = techTree.find(t => t.card_id === card.id);
        if (!techReq) return false;
        return techReq.required_building === building.buildingType;
      });

      if (unlockedCards.length > 0) {
        actions.addCardsToDeck(building.team, unlockedCards);
      }
    });
  }, [state.buildings, state.phase, allCards, techTree, actions]);
}
