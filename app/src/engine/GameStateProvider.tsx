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
  GameStateContext,
  createInitialState,
} from "./GameState";
import { Card, UnitStats } from "../data/loadData";

interface Props {
  children: ReactNode;
  config: Map<string, string>;
  allCards: Card[];
  allUnits: UnitStats[];
}

export function GameStateProvider({ children, config, allCards, allUnits }: Props) {
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
      const key = team === "player" ? "playerEnergy" : "cpuEnergy";
      setState((prev) => {
        if (prev[key] < card.cost) return prev; // Not enough energy

        const newState = { ...prev, [key]: prev[key] - card.cost };

        // Handle different effect types
        if (card.effect_type === "spawn_unit" && card.unit_id) {
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
  }), [allCards, allUnits]);

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
}
