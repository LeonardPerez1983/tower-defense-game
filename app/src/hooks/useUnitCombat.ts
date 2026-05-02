/**
 * useUnitCombat - Handles unit combat and attacking
 *
 * Units attack nearest enemy (units or buildings) within range.
 * Each unit has an attack cooldown to prevent instant kills.
 */

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useGameState } from "../engine/GameState";
import { getUnitVisual, getBuildingVisual, UnitId, BuildingId } from "../game/visuals/starcraftVisualConfig";
import { playSfx } from "../audio/soundManager";
import * as sfx from "../audio/sfx";

// Helper to map unit type to visual ID
const UNIT_ID_MAP: Record<string, UnitId> = {
  marine_unit: "terran_marine",
  firebat_unit: "terran_firebat",
  larva_unit: "zerg_larva",
  cocoon_unit: "zerg_cocoon",
  zergling_unit: "zerg_zergling",
  hydralisk_unit: "zerg_hydralisk",
  zealot_unit: "protoss_zealot",
  dragoon_unit: "protoss_dragoon",
};

const BUILDING_ID_MAP: Record<string, BuildingId> = {
  command_center: "terran_command_center",
  barracks: "terran_barracks",
  bunker: "terran_bunker",
  zerg_hatchery: "zerg_hatchery",
  spawning_pool: "zerg_spawning_pool",
  creep_colony: "zerg_creep_colony",
  sunken_colony: "zerg_sunken_colony",
  protoss_nexus: "protoss_nexus",
  protoss_gateway: "protoss_gateway",
  protoss_cannon: "protoss_photon_cannon",
};

function getUnitVisualId(unitType: string): UnitId | null {
  return UNIT_ID_MAP[unitType] || null;
}

function getBuildingVisualId(buildingType: string): BuildingId | null {
  return BUILDING_ID_MAP[buildingType] || null;
}

// Play attack sound based on unit type (only for player team to avoid spam)
function playAttackSound(unitType: string, team: string): void {
  if (team !== "player") return; // Only play sounds for player units

  switch (unitType) {
    case "marine_unit":
      playSfx(sfx.marine_shot, 0.4);
      break;
    case "firebat_unit":
      playSfx(sfx.firebat_flame, 0.3);
      break;
    case "zergling_unit":
      playSfx(sfx.zergling_slash, 0.4);
      break;
    case "hydralisk_unit":
      playSfx(sfx.hydralisk_spine, 0.4);
      break;
    case "zealot_unit":
      playSfx(sfx.zealot_slash, 0.4);
      break;
    case "dragoon_unit":
      playSfx(sfx.dragoon_plasma, 0.4);
      break;
  }
}

export function useUnitCombat() {
  const { state, actions } = useGameState();

  // Track last attack time for each unit
  const lastAttackTime = useRef<Map<string, number>>(new Map());

  useFrame((_, delta) => {
    if (state.phase !== "playing" || state.paused) return;

    const currentTime = performance.now();

    state.units.forEach(unit => {
      // Find all enemies (units and buildings)
      const enemyUnits = state.units.filter(u => u.team !== unit.team);
      const enemyBuildings = state.buildings.filter(b => b.team !== unit.team);

      // Get attacker's collision radius
      const attackerRadius = getUnitRadius(unit);

      // Find nearest enemy within attack range
      let nearestEnemy: { type: "unit" | "building"; id: string; distance: number } | null = null;

      // Check enemy units
      enemyUnits.forEach(enemy => {
        const dx = enemy.position[0] - unit.position[0];
        const dz = enemy.position[2] - unit.position[2];
        const centerDistance = Math.sqrt(dx * dx + dz * dz);

        // For melee: account for collision radii (edge-to-edge distance)
        const enemyRadius = getUnitRadius(enemy);
        const effectiveDistance = centerDistance - attackerRadius - enemyRadius;

        if (effectiveDistance <= unit.stats.attack_range) {
          if (!nearestEnemy || centerDistance < nearestEnemy.distance) {
            nearestEnemy = { type: "unit", id: enemy.id, distance: centerDistance };
          }
        }
      });

      // Check enemy buildings
      enemyBuildings.forEach(building => {
        const dx = building.position[0] - unit.position[0];
        const dz = building.position[2] - unit.position[2];
        const centerDistance = Math.sqrt(dx * dx + dz * dz);

        // For melee: account for collision radii (edge-to-edge distance)
        const buildingRadius = getBuildingRadius(building);
        const effectiveDistance = centerDistance - attackerRadius - buildingRadius;

        if (effectiveDistance <= unit.stats.attack_range) {
          if (!nearestEnemy || centerDistance < nearestEnemy.distance) {
            nearestEnemy = { type: "building", id: building.id, distance: centerDistance };
          }
        }
      });

      // Attack if target found and cooldown elapsed
      if (nearestEnemy) {
        const lastAttack = lastAttackTime.current.get(unit.id) || 0;
        const attackCooldown = 1000; // 1 second between attacks (TODO: add to CSV as attack_speed)

        if (currentTime - lastAttack >= attackCooldown) {
          lastAttackTime.current.set(unit.id, currentTime);

          // Get target position
          let targetPos: [number, number, number] = [0, 0, 0];
          if (nearestEnemy.type === "unit") {
            const target = enemyUnits.find(u => u.id === nearestEnemy.id);
            if (target) targetPos = target.position;
          } else {
            const target = enemyBuildings.find(b => b.id === nearestEnemy.id);
            if (target) targetPos = target.position;
          }

          // Get unit visual config for attack VFX
          const unitVisualId = getUnitVisualId(unit.unitType);
          const unitVisual = unitVisualId ? getUnitVisual(unitVisualId) : null;

          // Spawn visual effects
          if (unitVisual?.attackVfx) {
            const isRanged = unit.stats.attack_range > 1.5;

            if (isRanged) {
              // Calculate weapon offset position (front of unit, weapon height)
              const dirX = targetPos[0] - unit.position[0];
              const dirZ = targetPos[2] - unit.position[2];
              const dist = Math.sqrt(dirX * dirX + dirZ * dirZ);
              const normX = dist > 0 ? dirX / dist : 0;
              const normZ = dist > 0 ? dirZ / dist : 0;

              // Offset forward from unit center
              const forwardOffset = unitVisual.radius * 0.7;
              const weaponHeight = unitVisual.height * 0.7; // Weapon at ~70% of unit height

              const weaponPos: [number, number, number] = [
                unit.position[0] + normX * forwardOffset,
                unit.position[1] + weaponHeight,
                unit.position[2] + normZ * forwardOffset
              ];

              // Spawn projectile from weapon position
              actions.spawnProjectile({
                id: `proj-${unit.id}-${currentTime}`,
                startPos: weaponPos,
                endPos: [targetPos[0], targetPos[1] + 0.5, targetPos[2]],
                vfxType: unitVisual.attackVfx,
                startTime: currentTime,
                duration: 300, // ms
              });

              // Spawn muzzle flash at weapon position
              actions.spawnMuzzleFlash({
                id: `flash-${unit.id}-${currentTime}`,
                position: weaponPos,
                vfxType: unitVisual.attackVfx,
                startTime: currentTime,
              });
            } else {
              // Melee: calculate strike point (forward of unit toward target)
              const dirX = targetPos[0] - unit.position[0];
              const dirZ = targetPos[2] - unit.position[2];
              const dist = Math.sqrt(dirX * dirX + dirZ * dirZ);
              const normX = dist > 0 ? dirX / dist : 0;
              const normZ = dist > 0 ? dirZ / dist : 0;

              const strikeReach = unitVisual.radius * 1.2;
              const strikeHeight = unitVisual.height * 0.5;

              const impactPos: [number, number, number] = [
                unit.position[0] + normX * strikeReach,
                unit.position[1] + strikeHeight,
                unit.position[2] + normZ * strikeReach
              ];

              // Spawn melee impact at strike point
              actions.spawnMeleeImpact({
                id: `impact-${unit.id}-${currentTime}`,
                position: impactPos,
                startTime: currentTime,
              });
            }
          }

          // Play attack sound (only for player units)
          playAttackSound(unit.unitType, unit.team);

          // Deal damage and track for timer
          if (nearestEnemy.type === "unit") {
            actions.damageUnit(nearestEnemy.id, unit.stats.damage);
            actions.trackDamage(unit.team, unit.stats.damage, false);
          } else {
            const target = enemyBuildings.find(b => b.id === nearestEnemy.id);
            const isCentralStructure = target && (
              target.buildingType === "command_center" ||
              target.buildingType === "protoss_nexus" ||
              target.buildingType === "zerg_hatchery"
            );
            actions.damageBuilding(nearestEnemy.id, unit.stats.damage);
            actions.trackDamage(unit.team, unit.stats.damage, !!isCentralStructure);
          }
        }
      }
    });

    // Central structure combat (Command Center, Nexus, Hatchery defend themselves)
    state.buildings.forEach(building => {
      const isCentralStructure =
        building.buildingType === "command_center" ||
        building.buildingType === "protoss_nexus" ||
        building.buildingType === "zerg_hatchery";

      if (!isCentralStructure) return;

      // Get worker count for this team
      const workerCount = building.team === "player" ? state.playerWorkerCount : state.cpuWorkerCount;

      if (workerCount === 0) return; // No workers = no defense

      // Determine attack parameters based on faction
      let attackRange = 4.0; // Default (Terran Marine range)
      let workerDamage = 5; // Default (SCV damage)
      let attackVfx = "terran_bullet";

      const buildingVisualId = getBuildingVisualId(building.buildingType);
      const buildingVisual = buildingVisualId ? getBuildingVisual(buildingVisualId) : null;

      if (buildingVisual?.faction === "protoss") {
        attackRange = 6.0; // Dragoon range
        workerDamage = 3; // Probe damage
        attackVfx = "protoss_plasma";
      } else if (buildingVisual?.faction === "zerg") {
        attackRange = 5.0; // Hydralisk range
        workerDamage = 3; // Drone damage
        attackVfx = "zerg_spine";
      }

      // Total damage = worker damage * worker count
      const totalDamage = workerDamage * workerCount;

      // Find all enemies within range
      const enemyUnits = state.units.filter(u => u.team !== building.team);
      const enemyBuildings = state.buildings.filter(b => b.team !== building.team);

      let nearestEnemy: { type: "unit" | "building"; id: string; distance: number } | null = null;

      enemyUnits.forEach(enemy => {
        const dx = enemy.position[0] - building.position[0];
        const dz = enemy.position[2] - building.position[2];
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance <= attackRange) {
          if (!nearestEnemy || distance < nearestEnemy.distance) {
            nearestEnemy = { type: "unit", id: enemy.id, distance };
          }
        }
      });

      enemyBuildings.forEach(enemy => {
        const dx = enemy.position[0] - building.position[0];
        const dz = enemy.position[2] - building.position[2];
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance <= attackRange) {
          if (!nearestEnemy || distance < nearestEnemy.distance) {
            nearestEnemy = { type: "building", id: enemy.id, distance };
          }
        }
      });

      if (nearestEnemy) {
        const lastAttack = lastAttackTime.current.get(building.id) || 0;
        const attackCooldown = 1500; // 1.5 seconds (slower than workers)

        if (currentTime - lastAttack >= attackCooldown) {
          lastAttackTime.current.set(building.id, currentTime);

          // Get target position
          let targetPos: [number, number, number] = [0, 0, 0];
          if (nearestEnemy.type === "unit") {
            const target = enemyUnits.find(u => u.id === nearestEnemy.id);
            if (target) targetPos = target.position;
          } else {
            const target = enemyBuildings.find(b => b.id === nearestEnemy.id);
            if (target) targetPos = target.position;
          }

          // Calculate weapon position (top/front of building)
          const dirX = targetPos[0] - building.position[0];
          const dirZ = targetPos[2] - building.position[2];
          const dist = Math.sqrt(dirX * dirX + dirZ * dirZ);
          const normX = dist > 0 ? dirX / dist : 0;
          const normZ = dist > 0 ? dirZ / dist : 0;

          const buildingVisualId = getBuildingVisualId(building.buildingType);
          const buildingVisual = buildingVisualId ? getBuildingVisual(buildingVisualId) : null;
          const buildingRadius = buildingVisual?.radius || 1.0;

          const forwardOffset = buildingRadius * 0.5;
          const weaponHeight = building.stats.height * 0.8; // Weapon near top of building

          const weaponPos: [number, number, number] = [
            building.position[0] + normX * forwardOffset,
            building.position[1] + weaponHeight,
            building.position[2] + normZ * forwardOffset
          ];

          // Spawn projectile from weapon position
          actions.spawnProjectile({
            id: `proj-${building.id}-${currentTime}`,
            startPos: weaponPos,
            endPos: [targetPos[0], targetPos[1] + 0.5, targetPos[2]],
            vfxType: attackVfx,
            startTime: currentTime,
            duration: 400,
          });

          // Spawn muzzle flash at weapon position
          actions.spawnMuzzleFlash({
            id: `flash-${building.id}-${currentTime}`,
            position: weaponPos,
            vfxType: attackVfx,
            startTime: currentTime,
          });

          // Deal damage and track for timer
          if (nearestEnemy.type === "unit") {
            actions.damageUnit(nearestEnemy.id, totalDamage);
            actions.trackDamage(building.team, totalDamage, false);
          } else {
            const target = enemyBuildings.find(b => b.id === nearestEnemy.id);
            const isCentralStructure = target && (
              target.buildingType === "command_center" ||
              target.buildingType === "protoss_nexus" ||
              target.buildingType === "zerg_hatchery"
            );
            actions.damageBuilding(nearestEnemy.id, totalDamage);
            actions.trackDamage(building.team, totalDamage, !!isCentralStructure);
          }
        }
      }
    });

    // Building combat (Photon Cannons, etc.)
    state.buildings.forEach(building => {
      // Skip buildings that don't attack
      if (building.stats.attack_damage <= 0 || building.stats.attack_range <= 0) {
        return;
      }

      // Find all enemies (units and buildings)
      const enemyUnits = state.units.filter(u => u.team !== building.team);
      const enemyBuildings = state.buildings.filter(b => b.team !== building.team);

      // Find nearest enemy within attack range
      let nearestEnemy: { type: "unit" | "building"; id: string; distance: number } | null = null;

      // Check enemy units
      enemyUnits.forEach(enemy => {
        const dx = enemy.position[0] - building.position[0];
        const dz = enemy.position[2] - building.position[2];
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance <= building.stats.attack_range) {
          if (!nearestEnemy || distance < nearestEnemy.distance) {
            nearestEnemy = { type: "unit", id: enemy.id, distance };
          }
        }
      });

      // Check enemy buildings
      enemyBuildings.forEach(enemy => {
        const dx = enemy.position[0] - building.position[0];
        const dz = enemy.position[2] - building.position[2];
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance <= building.stats.attack_range) {
          if (!nearestEnemy || distance < nearestEnemy.distance) {
            nearestEnemy = { type: "building", id: enemy.id, distance };
          }
        }
      });

      // Attack if target found and cooldown elapsed
      if (nearestEnemy) {
        const lastAttack = lastAttackTime.current.get(building.id) || 0;
        const attackCooldown = (building.stats.attack_cooldown || 1.0) * 1000; // Convert seconds to ms

        if (currentTime - lastAttack >= attackCooldown) {
          lastAttackTime.current.set(building.id, currentTime);

          // Get target position
          let targetPos: [number, number, number] = [0, 0, 0];
          if (nearestEnemy.type === "unit") {
            const target = enemyUnits.find(u => u.id === nearestEnemy.id);
            if (target) targetPos = target.position;
          } else {
            const target = enemyBuildings.find(b => b.id === nearestEnemy.id);
            if (target) targetPos = target.position;
          }

          // Get building visual config for attack VFX
          const buildingVisualId = getBuildingVisualId(building.buildingType);
          const buildingVisual = buildingVisualId ? getBuildingVisual(buildingVisualId) : null;

          // Spawn visual effects (buildings are always ranged)
          if (buildingVisual?.attackVfx) {
            // Calculate weapon position (top/front of defensive building)
            const dirX = targetPos[0] - building.position[0];
            const dirZ = targetPos[2] - building.position[2];
            const dist = Math.sqrt(dirX * dirX + dirZ * dirZ);
            const normX = dist > 0 ? dirX / dist : 0;
            const normZ = dist > 0 ? dirZ / dist : 0;

            const forwardOffset = buildingVisual.radius * 0.5;
            const weaponHeight = building.stats.height * 0.8; // Turret/weapon near top

            const weaponPos: [number, number, number] = [
              building.position[0] + normX * forwardOffset,
              building.position[1] + weaponHeight,
              building.position[2] + normZ * forwardOffset
            ];

            // Spawn projectile from weapon position
            actions.spawnProjectile({
              id: `proj-${building.id}-${currentTime}`,
              startPos: weaponPos,
              endPos: [targetPos[0], targetPos[1] + 0.5, targetPos[2]],
              vfxType: buildingVisual.attackVfx,
              startTime: currentTime,
              duration: 400, // ms
            });

            // Spawn muzzle flash at weapon position
            actions.spawnMuzzleFlash({
              id: `flash-${building.id}-${currentTime}`,
              position: weaponPos,
              vfxType: buildingVisual.attackVfx,
              startTime: currentTime,
            });
          }

          // Deal damage and track for timer
          if (nearestEnemy.type === "unit") {
            actions.damageUnit(nearestEnemy.id, building.stats.attack_damage);
            actions.trackDamage(building.team, building.stats.attack_damage, false);
          } else {
            const target = enemyBuildings.find(b => b.id === nearestEnemy.id);
            const isCentralStructure = target && (
              target.buildingType === "command_center" ||
              target.buildingType === "protoss_nexus" ||
              target.buildingType === "zerg_hatchery"
            );
            actions.damageBuilding(nearestEnemy.id, building.stats.attack_damage);
            actions.trackDamage(building.team, building.stats.attack_damage, !!isCentralStructure);
          }
        }
      }
    });

    // Clean up dead units (health <= 0)
    state.units.forEach(unit => {
      if (unit.health <= 0) {
        // Spawn death explosion
        const color = unit.stats.faction === "terran" ? "#ff6b6b" :
                     unit.stats.faction === "zerg" ? "#9b59b6" :
                     unit.stats.faction === "protoss" ? "#60a5fa" : "#ffffff";

        actions.spawnDeathExplosion({
          id: `death-${unit.id}-${Date.now()}`,
          position: [unit.position[0], unit.position[1] + 0.3, unit.position[2]],
          size: 0.3,
          color,
          startTime: performance.now(),
        });

        actions.removeUnit(unit.id);
        lastAttackTime.current.delete(unit.id);
      }
    });

    // Check main buildings for game over condition
    state.buildings.forEach(building => {
      if (building.health <= 0) {
        // Spawn death explosion for all buildings
        const buildingVisualId = getBuildingVisualId(building.buildingType);
        const buildingVisual = buildingVisualId ? getBuildingVisual(buildingVisualId) : null;
        const color = buildingVisual?.faction === "terran" ? "#ff6b6b" :
                     buildingVisual?.faction === "zerg" ? "#9b59b6" :
                     buildingVisual?.faction === "protoss" ? "#60a5fa" : "#ffffff";

        actions.spawnDeathExplosion({
          id: `death-${building.id}-${Date.now()}`,
          position: [building.position[0], building.position[1] + building.stats.height / 2, building.position[2]],
          size: building.stats.width / 2,
          color,
          startTime: performance.now(),
        });

        // Main buildings trigger game over
        if (building.buildingType === "command_center" ||
            building.buildingType === "zerg_hatchery" ||
            building.buildingType === "protoss_nexus") {
          // Game over: main building destroyed (combat victory)
          const winner = building.team === "player" ? "cpu" : "player";
          actions.setWinner(winner, "combat");
          actions.setPhase("gameover");
        } else {
          // Regular buildings: remove when destroyed
          actions.removeBuilding(building.id);
          lastAttackTime.current.delete(building.id);
        }
      }
    });
  });
}
