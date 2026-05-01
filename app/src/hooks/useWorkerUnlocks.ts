/**
 * useWorkerUnlocks - Unlocks building cards when first worker completes
 *
 * When playerWorkerCount goes from 0 to 1+, add building cards to deck.
 */

import { useEffect, useRef } from "react";
import { useGameState } from "../engine/GameState";
import { Card } from "../data/loadData";

interface Props {
  allCards: Card[];
}

export function useWorkerUnlocks({ allCards }: Props) {
  const { state, actions } = useGameState();
  const playerHasUnlockedBuildings = useRef(false);
  const cpuHasUnlockedBuildings = useRef(false);

  useEffect(() => {
    if (state.phase !== "playing") return;

    // Player: When first worker completes, unlock building cards for their faction
    if (state.playerWorkerCount > 0 && !playerHasUnlockedBuildings.current) {
      playerHasUnlockedBuildings.current = true;

      const buildingCards = allCards.filter(c =>
        c.card_type === "building" && c.faction === state.playerFaction
      );

      if (buildingCards.length > 0) {
        // Expand cards to their max_copies count
        const cardsToAdd: Card[] = [];
        buildingCards.forEach(card => {
          const copies = card.max_copies || 1;
          for (let i = 0; i < copies; i++) {
            cardsToAdd.push(card);
          }
        });
        actions.addCardsToDeck("player", cardsToAdd);
      }
    }

    // CPU: When first worker completes, unlock building cards for their faction
    if (state.cpuWorkerCount > 0 && !cpuHasUnlockedBuildings.current) {
      cpuHasUnlockedBuildings.current = true;

      const buildingCards = allCards.filter(c =>
        c.card_type === "building" && c.faction === state.cpuFaction
      );
      if (buildingCards.length > 0) {
        // Expand cards to their max_copies count
        const cardsToAdd: Card[] = [];
        buildingCards.forEach(card => {
          const copies = card.max_copies || 1;
          for (let i = 0; i < copies; i++) {
            cardsToAdd.push(card);
          }
        });
        actions.addCardsToDeck("cpu", cardsToAdd);
      }
    }
  }, [state.phase, state.playerWorkerCount, state.cpuWorkerCount, state.playerFaction, state.cpuFaction, allCards, actions]);
}
