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

  // Track which cards have been unlocked for each team to prevent duplicates
  const unlockedCards = useRef<{ player: Set<string>, cpu: Set<string> }>({
    player: new Set(),
    cpu: new Set()
  });

  useEffect(() => {
    if (state.phase !== "playing") return;

    // Check each building
    state.buildings.forEach(building => {
      // Skip if already processed
      if (processedBuildings.current.has(building.id)) return;

      // Skip if still under construction (only unlock when complete)
      if (building.constructionStartTime !== undefined) return;

      // Mark as processed
      processedBuildings.current.add(building.id);

      // Get the faction for this team
      const teamFaction = building.team === "player" ? state.playerFaction : state.cpuFaction;

      // Check for upgrade cards that target this building type
      const upgradeCards = allCards.filter(card => {
        if (card.faction !== teamFaction) return false;
        if (card.effect_type !== "upgrade_building") return false;
        return card.effect_value === building.buildingType; // effect_value is the target building type
      });

      if (upgradeCards.length > 0) {
        // Add 1 copy of each upgrade card (max_copies for upgrades is always 1)
        actions.addCardsToDeck(building.team, upgradeCards);
      }

      // Find cards (units AND buildings) that are unlocked by this building via tech tree
      // AND match the team's faction
      const newlyUnlockedCards = allCards.filter(card => {
        if (card.faction !== teamFaction) return false; // Only unlock cards from the team's faction

        // Skip if already unlocked for this team
        const teamUnlocked = building.team === "player" ? unlockedCards.current.player : unlockedCards.current.cpu;
        if (teamUnlocked.has(card.id)) return false;

        const techReq = techTree.find(t => t.card_id === card.id);
        if (!techReq) return false;
        return techReq.required_building === building.buildingType;
      });

      if (newlyUnlockedCards.length > 0) {
        // Mark as unlocked for this team
        const teamUnlocked = building.team === "player" ? unlockedCards.current.player : unlockedCards.current.cpu;
        newlyUnlockedCards.forEach(card => teamUnlocked.add(card.id));

        // Expand cards to their max_copies count
        const cardsToAdd: Card[] = [];
        newlyUnlockedCards.forEach(card => {
          const copies = card.max_copies || 1;
          for (let i = 0; i < copies; i++) {
            cardsToAdd.push(card);
          }
        });

        actions.addCardsToDeck(building.team, cardsToAdd);
      }
    });
  }, [state.buildings, state.phase, allCards, techTree, actions]);
}
