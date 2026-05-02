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
  ProductionQueueEntry,
} from "./GameState";
import { Card, UnitStats, Building, TechTreeEntry } from "../data/loadData";
import { playSfx } from "../audio/soundManager";
import * as sfx from "../audio/sfx";

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

  // Helper: Try to draw cards until hand reaches 4
  const tryDraw = (team: "player" | "cpu") => {
    setState((prev) => {
      const deckKey = team === "player" ? "playerDeck" : "cpuDeck";
      const handKey = team === "player" ? "playerHand" : "cpuHand";
      const discardKey = team === "player" ? "playerDiscard" : "cpuDiscard";

      let deck = [...prev[deckKey]];
      let hand = [...prev[handKey]];
      let discard = [...prev[discardKey]];

      // Keep drawing while hand < 4 and cards available
      while (hand.length < 4) {
        // If deck empty, shuffle discard into deck
        if (deck.length === 0 && discard.length > 0) {
          deck = [...discard].sort(() => Math.random() - 0.5);
          discard = [];
        }

        // Draw one card
        if (deck.length > 0) {
          hand.push(deck[0]);
          deck = deck.slice(1);
        } else {
          // No cards available
          break;
        }
      }

      return {
        ...prev,
        [deckKey]: deck,
        [handKey]: hand,
        [discardKey]: discard,
      };
    });
  };

  const actions: GameActions = useMemo(() => ({
    setPhase: (phase: GamePhase) => {
      setState((prev) => {
        const newState: any = { ...prev, phase };

        // Start battle timer when game starts
        if (phase === "playing" && prev.phase !== "playing") {
          newState.battleStartTime = performance.now();
        }

        return newState;
      });
    },

    setPaused: (paused: boolean) => {
      setState((prev) => ({ ...prev, paused }));
    },

    setFactions: (playerFaction: "terran" | "protoss" | "zerg", cpuFaction: "terran" | "protoss" | "zerg") => {
      setState((prev) => ({
        ...prev,
        playerFaction,
        cpuFaction,
        // Set starting energy based on faction
        playerEnergy: playerFaction === "protoss" ? 7 : prev.maxEnergy,
        cpuEnergy: cpuFaction === "protoss" ? 7 : prev.maxEnergy,
      }));
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

        // Remove FIRST instance of card from hand
        const hand = [...prev[handKey]];
        const cardIndex = hand.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
          hand.splice(cardIndex, 1);
        }

        // Only add to discard if NOT permanently removed (workers are permanent)
        if (!card.is_permanent_removal) {
          newState[discardKey] = [...prev[discardKey], card];
        }

        // Draw a new card immediately to replace the played card
        let deck = [...prev[deckKey]];
        let discard = [...newState[discardKey]];

        // If deck is empty, shuffle discard pile back into deck
        if (deck.length === 0 && discard.length > 0) {
          // If we just added a card to discard (not permanently removed), exclude it from shuffle
          if (!card.is_permanent_removal && discard.length > 1) {
            const justDiscarded = discard.pop()!;
            deck = [...discard].sort(() => Math.random() - 0.5);
            discard = [justDiscarded]; // Keep only the just-played card in discard
          } else {
            // No just-discarded card to exclude (or it's the only one)
            deck = [...discard].sort(() => Math.random() - 0.5);
            discard = [];
          }
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
              shields: unitStats.max_shields,
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
              shields: buildingStats.max_shields,
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

      // Play unit spawn sound (only for player units to avoid audio spam)
      if (unit.team === "player") {
        playSfx(sfx.unit_spawn);
      }
    },

    removeUnit: (unitId: string) => {
      setState((prev) => ({
        ...prev,
        units: prev.units.filter((u) => u.id !== unitId),
      }));
    },

    damageUnit: (unitId: string, damage: number) => {
      setState((prev) => {
        const currentTime = performance.now();

        return {
          ...prev,
          units: prev.units.map((u) => {
            if (u.id !== unitId) return u;

            let remainingDamage = damage;
            let newShields = u.shields;
            let newHealth = u.health;

            // Shields absorb damage first
            if (newShields > 0) {
              if (remainingDamage >= newShields) {
                remainingDamage -= newShields;
                newShields = 0;
              } else {
                newShields -= remainingDamage;
                remainingDamage = 0;
              }
            }

            // Remaining damage goes to health
            if (remainingDamage > 0) {
              newHealth = Math.max(0, newHealth - remainingDamage);
            }

            return {
              ...u,
              shields: newShields,
              health: newHealth,
              lastShieldDamageTime: newShields < u.stats.max_shields ? currentTime : u.lastShieldDamageTime,
            };
          }),
        };
      });
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

    initializeDeck: (team: "player" | "cpu", cards: Card[]) => {
      // Shuffle the deck (cards are already the exact copies we want)
      const shuffled = [...cards].sort(() => Math.random() - 0.5);

      setState((prev) => {
        const deckKey = team === "player" ? "playerDeck" : "cpuDeck";
        const handKey = team === "player" ? "playerHand" : "cpuHand";
        const discardKey = team === "player" ? "playerDiscard" : "cpuDiscard";

        // Draw initial hand of up to 4 cards
        const hand = shuffled.slice(0, Math.min(4, shuffled.length));
        const remainingDeck = shuffled.slice(hand.length);

        return {
          ...prev,
          [deckKey]: remainingDeck,
          [handKey]: hand,
          [discardKey]: [], // Clear discard pile
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
      setState((prev) => {
        // Find the building being removed
        const building = prev.buildings.find(b => b.id === buildingId);
        if (!building) return prev;

        // Check if it's a Zerg tech building that should be re-added to deck
        const zergTechBuildings = ["spawning_pool", "hydralisk_den"];
        const shouldReAddCard = zergTechBuildings.includes(building.buildingType);

        let updatedDiscard = building.team === "player" ? prev.playerDiscard : prev.cpuDiscard;
        let updatedHand = building.team === "player" ? prev.playerHand : prev.cpuHand;
        let updatedDeck = building.team === "player" ? prev.playerDeck : prev.cpuDeck;

        if (shouldReAddCard) {
          // Find the card for this building
          const buildingCard = allCards.find(c => c.id === building.buildingType);
          if (buildingCard) {
            // Add the card back to discard pile (it'll shuffle into deck)
            updatedDiscard = [...updatedDiscard, buildingCard];
          }
        }

        // If this is a Creep Colony, remove its linked upgrade card (Sunken Colony)
        if (building.buildingType === "creep_colony") {
          const upgradeCardId = "sunken_colony";

          // Remove one instance from hand
          const handIndex = updatedHand.findIndex(c => c.id === upgradeCardId);
          if (handIndex !== -1) {
            updatedHand = [...updatedHand];
            updatedHand.splice(handIndex, 1);
          } else {
            // Try deck
            const deckIndex = updatedDeck.findIndex(c => c.id === upgradeCardId);
            if (deckIndex !== -1) {
              updatedDeck = [...updatedDeck];
              updatedDeck.splice(deckIndex, 1);
            } else {
              // Try discard
              const discardIndex = updatedDiscard.findIndex(c => c.id === upgradeCardId);
              if (discardIndex !== -1) {
                updatedDiscard = [...updatedDiscard];
                updatedDiscard.splice(discardIndex, 1);
              }
            }
          }
        }

        return {
          ...prev,
          buildings: prev.buildings.filter((b) => b.id !== buildingId),
          ...(building.team === "player"
            ? {
                playerDiscard: updatedDiscard,
                playerHand: updatedHand,
                playerDeck: updatedDeck,
              }
            : {
                cpuDiscard: updatedDiscard,
                cpuHand: updatedHand,
                cpuDeck: updatedDeck,
              }
          ),
        };
      });
    },

    damageBuilding: (buildingId: string, damage: number) => {
      setState((prev) => {
        const currentTime = performance.now();
        const targetBuilding = prev.buildings.find(b => b.id === buildingId);

        const updatedBuildings = prev.buildings.map((b) => {
          if (b.id !== buildingId) return b;

          let remainingDamage = damage;
          let newShields = b.shields;
          let newHealth = b.health;
          let shieldsWereDamaged = false;
          let healthWasDamaged = false;

          // Shields absorb damage first
          if (newShields > 0) {
            shieldsWereDamaged = true;
            if (remainingDamage >= newShields) {
              remainingDamage -= newShields;
              newShields = 0;
            } else {
              newShields -= remainingDamage;
              remainingDamage = 0;
            }
          }

          // Remaining damage goes to health
          if (remainingDamage > 0) {
            healthWasDamaged = true;
            newHealth = Math.max(0, newHealth - remainingDamage);
          }

          // Play hit sounds (only for player buildings)
          if (b.team === "player") {
            if (shieldsWereDamaged && healthWasDamaged) {
              // Both shields and health damaged - play shield break sound
              playSfx(sfx.shield_hit, 0.3);
              playSfx(sfx.structure_hit, 0.3);
            } else if (shieldsWereDamaged) {
              playSfx(sfx.shield_hit, 0.3);
            } else if (healthWasDamaged) {
              playSfx(sfx.structure_hit, 0.3);
            }
          }

          return {
            ...b,
            shields: newShields,
            health: newHealth,
            lastShieldDamageTime: newShields < b.stats.max_shields ? currentTime : b.lastShieldDamageTime,
          };
        });

        // Check if a Command Center or Nexus was destroyed (game over condition)
        const destroyedBuilding = updatedBuildings.find(b => b.id === buildingId);
        if (destroyedBuilding &&
            (destroyedBuilding.buildingType === "command_center" || destroyedBuilding.buildingType === "protoss_nexus") &&
            destroyedBuilding.health <= 0) {
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
        const discardKey = team === "player" ? "playerDiscard" : "cpuDiscard";

        // Add unlocked cards to discard pile (they'll shuffle into deck when needed)
        const updatedDiscard = [...prev[discardKey], ...cards];

        return {
          ...prev,
          [discardKey]: updatedDiscard,
        };
      });

      // After unlocking cards, try to draw
      tryDraw(team);
    },

    queueProduction: (team: "player" | "cpu", card: Card, buildingId: string) => {
      setState((prev) => {
        const energyKey = team === "player" ? "playerEnergy" : "cpuEnergy";
        if (prev[energyKey] < card.cost) return prev; // Not enough energy

        // For Zerg units, check and consume larva
        if (card.faction === "zerg" && card.effect_type === "spawn_unit") {
          const larvaCount = prev.larvaCount.get(buildingId) || 0;
          if (larvaCount <= 0) return prev; // No larva available at this Hatchery
        }

        const queueKey = team === "player" ? "playerProductionQueue" : "cpuProductionQueue";
        const handKey = team === "player" ? "playerHand" : "cpuHand";
        const discardKey = team === "player" ? "playerDiscard" : "cpuDiscard";

        // Create queue entry
        const entry = {
          cardId: card.id,
          buildingId,
          startTime: performance.now(),
          buildTime: card.build_time,
        };

        // Remove card from hand
        const hand = [...prev[handKey]];
        const cardIndex = hand.findIndex(c => c.id === card.id);
        if (cardIndex !== -1) {
          hand.splice(cardIndex, 1);
        }

        // Handle card lifecycle: if not permanent removal, add to discard
        const discard = card.is_permanent_removal
          ? [...prev[discardKey]]  // Workers: removed from game, don't add to discard
          : [...prev[discardKey], card];  // Units/Buildings: go to discard

        // Consume larva for Zerg units
        let newLarvaCount = prev.larvaCount;
        if (card.faction === "zerg" && card.effect_type === "spawn_unit") {
          newLarvaCount = new Map(prev.larvaCount);
          const currentCount = newLarvaCount.get(buildingId) || 0;
          newLarvaCount.set(buildingId, currentCount - 1);
        }

        return {
          ...prev,
          [handKey]: hand,
          [discardKey]: discard,
          [queueKey]: [...prev[queueKey], entry],
          [energyKey]: prev[energyKey] - card.cost,
          larvaCount: newLarvaCount,
        };
      });

      // After state update, try to draw
      tryDraw(team);
    },

    completeProduction: (team: "player" | "cpu", queueEntry) => {
      setState((prev) => {
        const queueKey = team === "player" ? "playerProductionQueue" : "cpuProductionQueue";

        // Remove from queue
        const newQueue = prev[queueKey].filter(e => e !== queueEntry);

        // Find the card that was being produced
        const card = allCards.find(c => c.id === queueEntry.cardId);
        if (!card) return { ...prev, [queueKey]: newQueue };

        let newState = { ...prev, [queueKey]: newQueue };

        if (card.effect_type === "add_worker") {
          // SCV completed: increment worker count
          const workerKey = team === "player" ? "playerWorkerCount" : "cpuWorkerCount";
          newState[workerKey] = prev[workerKey] + 1;

        } else if (card.effect_type === "spawn_unit") {
          // Unit completed: spawn from building location
          const building = prev.buildings.find(b => b.id === queueEntry.buildingId);
          if (building) {
            const unitStats = allUnits.find(u => u.id === card.unit_id);
            if (unitStats) {
              // Spawn with more spread to prevent stacking
              const angle = Math.random() * Math.PI * 2; // Random angle
              const distance = 1.0 + Math.random() * 0.5; // 1.0-1.5 units away
              const spawnPos: [number, number, number] = [
                building.position[0] + Math.cos(angle) * distance,
                0,
                building.position[2] + Math.sin(angle) * distance,
              ];

              const newUnit: Unit = {
                id: `${team}-${Date.now()}-${Math.random()}`,
                unitType: card.unit_id!,
                team,
                position: spawnPos,
                health: unitStats.health,
                shields: unitStats.max_shields,
                stats: unitStats,
              };

              newState.units = [...prev.units, newUnit];

              // Track unit creation for battle timer
              if (team === "player") {
                newState.playerUnitsCreated = prev.playerUnitsCreated + 1;
              } else {
                newState.cpuUnitsCreated = prev.cpuUnitsCreated + 1;
              }
            }
          }
        } else if (card.effect_type === "spawn_building") {
          // Building construction completed: mark as complete (clear construction fields)
          newState.buildings = prev.buildings.map(b =>
            b.id === queueEntry.buildingId
              ? { ...b, constructionStartTime: undefined, constructionDuration: undefined }
              : b
          );
        }

        return newState;
      });
    },

    discardCard: (team: "player" | "cpu", cardId: string) => {
      setState((prev) => {
        const card = allCards.find(c => c.id === cardId);
        if (!card || card.discard_cost === undefined) return prev;

        // Check energy
        const energyKey = team === "player" ? "playerEnergy" : "cpuEnergy";
        if (prev[energyKey] < card.discard_cost) return prev;

        // Add to discard pile
        const discardKey = team === "player" ? "playerDiscard" : "cpuDiscard";

        return {
          ...prev,
          [energyKey]: prev[energyKey] - card.discard_cost,
          [discardKey]: [...prev[discardKey], card],
        };
      });
    },

    updateUnitShields: (unitId: string, shields: number) => {
      setState((prev) => ({
        ...prev,
        units: prev.units.map((u) =>
          u.id === unitId ? { ...u, shields } : u
        ),
      }));
    },

    updateBuildingShields: (buildingId: string, shields: number) => {
      setState((prev) => ({
        ...prev,
        buildings: prev.buildings.map((b) =>
          b.id === buildingId ? { ...b, shields } : b
        ),
      }));
    },

    updateCreep: (creepTiles: Set<string>) => {
      setState((prev) => ({
        ...prev,
        creepTiles,
      }));
    },

    addLarva: (buildingId: string) => {
      setState((prev) => {
        const currentCount = prev.larvaCount.get(buildingId) || 0;
        if (currentCount >= 3) return prev; // Max 3 larva per Hatchery

        const newLarvaCount = new Map(prev.larvaCount);
        newLarvaCount.set(buildingId, currentCount + 1);

        return {
          ...prev,
          larvaCount: newLarvaCount,
        };
      });
    },

    consumeLarva: (buildingId: string) => {
      let success = false;
      setState((prev) => {
        const currentCount = prev.larvaCount.get(buildingId) || 0;
        if (currentCount <= 0) {
          success = false;
          return prev; // No larva available
        }

        const newLarvaCount = new Map(prev.larvaCount);
        newLarvaCount.set(buildingId, currentCount - 1);
        success = true;

        return {
          ...prev,
          larvaCount: newLarvaCount,
        };
      });
      return success;
    },

    upgradeBuilding: (buildingId: string, newBuildingType: string) => {
      setState((prev) => {
        const buildingIndex = prev.buildings.findIndex(b => b.id === buildingId);
        if (buildingIndex === -1) return prev;

        const oldBuilding = prev.buildings[buildingIndex];
        const newBuildingStats = allBuildings.find(b => b.id === newBuildingType);
        if (!newBuildingStats) return prev;

        // Create upgraded building (keeps position, ID, team)
        const upgradedBuilding: PlacedBuilding = {
          ...oldBuilding,
          buildingType: newBuildingType,
          health: newBuildingStats.health,
          shields: newBuildingStats.max_shields,
          stats: newBuildingStats,
        };

        const newBuildings = [...prev.buildings];
        newBuildings[buildingIndex] = upgradedBuilding;

        return {
          ...prev,
          buildings: newBuildings,
        };
      });
    },

    // Combat visual effects
    spawnProjectile: (projectile) => {
      setState((prev) => ({
        ...prev,
        activeProjectiles: [...prev.activeProjectiles, projectile],
      }));
    },

    removeProjectile: (id) => {
      setState((prev) => ({
        ...prev,
        activeProjectiles: prev.activeProjectiles.filter(p => p.id !== id),
      }));
    },

    spawnMuzzleFlash: (flash) => {
      setState((prev) => ({
        ...prev,
        activeMuzzleFlashes: [...prev.activeMuzzleFlashes, flash],
      }));
    },

    removeMuzzleFlash: (id) => {
      setState((prev) => ({
        ...prev,
        activeMuzzleFlashes: prev.activeMuzzleFlashes.filter(f => f.id !== id),
      }));
    },

    spawnMeleeImpact: (impact) => {
      setState((prev) => ({
        ...prev,
        activeMeleeImpacts: [...prev.activeMeleeImpacts, impact],
      }));
    },

    removeMeleeImpact: (id) => {
      setState((prev) => ({
        ...prev,
        activeMeleeImpacts: prev.activeMeleeImpacts.filter(i => i.id !== id),
      }));
    },

    spawnDeathExplosion: (explosion) => {
      setState((prev) => ({
        ...prev,
        activeDeathExplosions: [...prev.activeDeathExplosions, explosion],
      }));
    },

    removeDeathExplosion: (id) => {
      setState((prev) => ({
        ...prev,
        activeDeathExplosions: prev.activeDeathExplosions.filter(e => e.id !== id),
      }));
    },

    // Battle timer tracking
    startBattle: () => {
      setState((prev) => ({
        ...prev,
        battleStartTime: performance.now(),
      }));
    },

    trackDamage: (attackerTeam: "player" | "cpu", damage: number, isCentralStructure: boolean) => {
      setState((prev) => {
        const newState = { ...prev };

        // Track total damage dealt
        if (attackerTeam === "player") {
          newState.playerTotalDamageDealt = prev.playerTotalDamageDealt + damage;
        } else {
          newState.cpuTotalDamageDealt = prev.cpuTotalDamageDealt + damage;
        }

        // Track central structure damage
        if (isCentralStructure) {
          if (attackerTeam === "player") {
            newState.cpuCentralStructureDamageTaken = prev.cpuCentralStructureDamageTaken + damage;
          } else {
            newState.playerCentralStructureDamageTaken = prev.playerCentralStructureDamageTaken + damage;
          }
        }

        return newState;
      });
    },

    trackUnitCreated: (team: "player" | "cpu") => {
      setState((prev) => ({
        ...prev,
        playerUnitsCreated: team === "player" ? prev.playerUnitsCreated + 1 : prev.playerUnitsCreated,
        cpuUnitsCreated: team === "cpu" ? prev.cpuUnitsCreated + 1 : prev.cpuUnitsCreated,
      }));
    },

    setWinner: (winner: "player" | "cpu" | "tie") => {
      setState((prev) => ({
        ...prev,
        winner,
      }));
    },
  }), [allCards, allUnits, allBuildings]);

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
}
