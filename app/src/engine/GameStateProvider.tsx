/**
 * GameStateProvider - React Context provider for game state
 *
 * Wraps the app and provides game state + actions to all components.
 */

import { ReactNode, useState, useMemo } from "react";
import {
  GameState,
  GameActions,
  GamePhase,
  Unit,
  PlacedBuilding,
  GameStateContext,
  createInitialState,
} from "./GameState";
import { Card, UnitStats, Building, TechTreeEntry } from "../data/loadData";

interface Props {
  children: ReactNode;
  config: Map<string, string>;
  allCards: Card[];
  allUnits: UnitStats[];
  allBuildings: Building[];
  techTree: TechTreeEntry[];
}

export function GameStateProvider({ children, config, allCards, allUnits, allBuildings, techTree }: Props) {
  const [state, setState] = useState<GameState>(() => createInitialState(config));

  const actions: GameActions = useMemo(() => ({
    setPhase: (phase: GamePhase) => {
      setState((prev) => ({ ...prev, phase }));
    },

    addEnergy: (team: "player" | "cpu", amount: number) => {
      setState((prev) => {
        const key = team === "player" ? "playerEnergy" : "cpuEnergy";
        return {
          ...prev,
          [key]: Math.min(prev[key] + amount, prev.maxEnergy),
        };
      });
    },

    spendEnergy: (team: "player" | "cpu", amount: number) => {
      let success = false;
      setState((prev) => {
        const key = team === "player" ? "playerEnergy" : "cpuEnergy";
        if (prev[key] >= amount) {
          success = true;
          return { ...prev, [key]: prev[key] - amount };
        }
        return prev;
      });
      return success;
    },

    playCard: (team: "player" | "cpu", cardId: string, position: [number, number, number]) => {
      const card = allCards.find((c) => c.id === cardId);
      if (!card) return;

      // Try to spend energy
      const energyKey = team === "player" ? "playerEnergy" : "cpuEnergy";
      setState((prev) => {
        if (prev[energyKey] < card.cost) return prev; // Not enough energy

        const handKey = team === "player" ? "playerHand" : "cpuHand";
        const deckKey = team === "player" ? "playerDeck" : "cpuDeck";
        const discardKey = team === "player" ? "playerDiscard" : "cpuDiscard";

        const newState = { ...prev, [energyKey]: prev[energyKey] - card.cost };

        // Remove FIRST instance of card from hand and add to discard
        const hand = [...prev[handKey]];
        const cardIndex = hand.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
          hand.splice(cardIndex, 1);
        }
        newState[discardKey] = [...prev[discardKey], card];

        // Draw a new card immediately to replace the played card
        let deck = [...prev[deckKey]];
        let discard = [...newState[discardKey]];

        // If deck is empty, shuffle discard pile back into deck (excluding the card we just added)
        if (deck.length === 0 && discard.length > 1) {
          // Remove the card we just discarded from the pile temporarily
          const justDiscarded = discard.pop()!;
          deck = [...discard].sort(() => Math.random() - 0.5);
          discard = [justDiscarded]; // Keep only the just-played card in discard
        }

        // Draw a card if deck has cards
        if (deck.length > 0 && hand.length < 4) {
          const drawnCard = deck[0];
          hand.push(drawnCard);
          deck = deck.slice(1);
        }

        newState[handKey] = hand;
        newState[deckKey] = deck;
        newState[discardKey] = discard;

        // Handle different effect types
        if (card.effect_type === "add_worker") {
          // Add worker (no visible unit, just boost production)
          const workerKey = team === "player" ? "playerWorkerCount" : "cpuWorkerCount";
          if (prev[workerKey] < prev.maxWorkers) {
            newState[workerKey] = prev[workerKey] + 1;
          }
        } else if (card.effect_type === "spawn_unit" && card.unit_id) {
          const unitStats = allUnits.find((u) => u.id === card.unit_id);
          if (unitStats) {
            const newUnit: Unit = {
              id: `${team}-${Date.now()}-${Math.random()}`,
              unitType: card.unit_id,
              team,
              position,
              health: unitStats.health,
              stats: unitStats,
            };
            newState.units = [...prev.units, newUnit];
          }
        } else if (card.effect_type === "spawn_building") {
          const buildingStats = allBuildings.find((b) => b.id === card.id);
          if (buildingStats) {
            const newBuilding: PlacedBuilding = {
              id: `${team}-${Date.now()}-${Math.random()}`,
              buildingType: card.id,
              team,
              position,
              health: buildingStats.health,
              stats: buildingStats,
            };
            newState.buildings = [...prev.buildings, newBuilding];
          }
        }
        // TODO: Handle damage, heal, stun effects in Phase 4

        return newState;
      });
    },

    spawnUnit: (unit: Unit) => {
      setState((prev) => ({
        ...prev,
        units: [...prev.units, unit],
      }));
    },

    removeUnit: (unitId: string) => {
      setState((prev) => ({
        ...prev,
        units: prev.units.filter((u) => u.id !== unitId),
      }));
    },

    damageUnit: (unitId: string, damage: number) => {
      setState((prev) => ({
        ...prev,
        units: prev.units.map((u) =>
          u.id === unitId
            ? { ...u, health: Math.max(0, u.health - damage) }
            : u
        ),
      }));
    },

    updateUnitPosition: (unitId: string, position: [number, number, number]) => {
      setState((prev) => ({
        ...prev,
        units: prev.units.map((u) =>
          u.id === unitId ? { ...u, position } : u
        ),
      }));
    },

    setUnitWaypoints: (unitId: string, waypoints: [number, number, number][], currentIndex: number) => {
      setState((prev) => ({
        ...prev,
        units: prev.units.map((u) =>
          u.id === unitId ? { ...u, waypoints, currentWaypointIndex: currentIndex } : u
        ),
      }));
    },

    damageTower: (team: "player" | "cpu", damage: number) => {
      setState((prev) => {
        const key = team === "player" ? "playerTowerHP" : "cpuTowerHP";
        const newHP = Math.max(0, prev[key] - damage);

        // Check for game over
        if (newHP <= 0) {
          return { ...prev, [key]: 0, phase: "gameover" };
        }

        return { ...prev, [key]: newHP };
      });
    },

    setPlayerHand: (cards: Card[]) => {
      setState((prev) => ({ ...prev, playerHand: cards }));
    },

    setCpuHand: (cards: Card[]) => {
      setState((prev) => ({ ...prev, cpuHand: cards }));
    },

    initializeDeck: (team: "player" | "cpu", allCards: Card[]) => {
      // Create a deck with multiple copies of each card for cycling
      const deck: Card[] = [];
      allCards.forEach(card => {
        // Add 4 copies of each card to ensure deck cycling
        deck.push(card, card, card, card);
      });

      // Shuffle the deck
      const shuffled = [...deck].sort(() => Math.random() - 0.5);

      setState((prev) => {
        const deckKey = team === "player" ? "playerDeck" : "cpuDeck";
        const handKey = team === "player" ? "playerHand" : "cpuHand";

        // Draw initial hand of 4 cards
        const hand = shuffled.slice(0, 4);
        const remainingDeck = shuffled.slice(4);

        return {
          ...prev,
          [deckKey]: remainingDeck,
          [handKey]: hand,
        };
      });
    },

    drawCard: (team: "player" | "cpu") => {
      setState((prev) => {
        const deckKey = team === "player" ? "playerDeck" : "cpuDeck";
        const handKey = team === "player" ? "playerHand" : "cpuHand";
        const discardKey = team === "player" ? "playerDiscard" : "cpuDiscard";

        let deck = [...prev[deckKey]];
        const hand = [...prev[handKey]];
        let discard = [...prev[discardKey]];

        // If deck is empty, shuffle discard pile back into deck
        if (deck.length === 0 && discard.length > 0) {
          deck = [...discard].sort(() => Math.random() - 0.5);
          discard = [];
        }

        // Draw a card if deck has cards and hand is not full
        if (deck.length > 0 && hand.length < 4) {
          const drawnCard = deck[0];
          hand.push(drawnCard);
          deck = deck.slice(1);
        }

        return {
          ...prev,
          [deckKey]: deck,
          [handKey]: hand,
          [discardKey]: discard,
        };
      });
    },

    placeBuilding: (building: PlacedBuilding) => {
      setState((prev) => ({
        ...prev,
        buildings: [...prev.buildings, building],
      }));
    },

    removeBuilding: (buildingId: string) => {
      setState((prev) => ({
        ...prev,
        buildings: prev.buildings.filter((b) => b.id !== buildingId),
      }));
    },

    damageBuilding: (buildingId: string, damage: number) => {
      setState((prev) => {
        const updatedBuildings = prev.buildings.map((b) =>
          b.id === buildingId
            ? { ...b, health: Math.max(0, b.health - damage) }
            : b
        );

        // Check if a Command Center was destroyed (game over condition)
        const destroyedBuilding = updatedBuildings.find(b => b.id === buildingId);
        if (destroyedBuilding && destroyedBuilding.buildingType === "command_center" && destroyedBuilding.health <= 0) {
          return {
            ...prev,
            buildings: updatedBuildings,
            phase: "gameover",
          };
        }

        return {
          ...prev,
          buildings: updatedBuildings,
        };
      });
    },

    addWorker: (team: "player" | "cpu") => {
      setState((prev) => {
        const workerKey = team === "player" ? "playerWorkerCount" : "cpuWorkerCount";
        if (prev[workerKey] >= prev.maxWorkers) return prev;
        return { ...prev, [workerKey]: prev[workerKey] + 1 };
      });
    },

    addCardsToDeck: (team: "player" | "cpu", cards: Card[]) => {
      setState((prev) => {
        const deckKey = team === "player" ? "playerDeck" : "cpuDeck";

        // Add 4 copies of each new card to deck
        const newCards: Card[] = [];
        cards.forEach(card => {
          newCards.push(card, card, card, card);
        });

        // Shuffle new cards into existing deck
        const updatedDeck = [...prev[deckKey], ...newCards].sort(() => Math.random() - 0.5);

        return {
          ...prev,
          [deckKey]: updatedDeck,
        };
      });
    },
  }), [allCards, allUnits, allBuildings]);

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
}
