# StarCraft: Brood War Faction Building and Unit Trees

Assumption: This file describes **StarCraft: Brood War / StarCraft 1**.

Notation:
- `M/G` = Minerals / Gas
- `N` = Normal damage
- `E` = Explosive damage
- `C` = Concussive damage
- `S` = Splash
- `Power` = base attack damage per hit, before upgrades and matchup modifiers
- `—` = not applicable

## Global Combat Damage Model

| Damage Type | Vs Small | Vs Medium | Vs Large | Notes |
|---|---:|---:|---:|---|
| Normal | 100% | 100% | 100% | General-purpose damage |
| Explosive | 50% | 75% | 100% | Best against large targets |
| Concussive | 100% | 50% | 25% | Best against small targets |

---

# Terran

## Terran Production Model

Terran units are produced from class-specific production buildings:
- `Command Center` produces workers.
- `Barracks` produces infantry.
- `Factory` produces vehicles.
- `Starport` produces air units.
- Add-ons unlock advanced units or upgrades.

## Terran Building / Tech Tree

| Tier | Building | Cost M/G | Unlocks / Produces | Prerequisite |
|---|---:|---:|---|---|
| Base | Command Center | 400/0 | SCV; Comsat Station; Nuclear Silo | — |
| Base | Supply Depot | 100/0 | Supply | Command Center |
| Base | Refinery | 100/0 | Gas income | Vespene geyser |
| T1 | Barracks | 150/0 | Marine; Firebat; Medic; Ghost | Command Center |
| T1 Tech | Academy | 150/0 | Firebat; Medic; Infantry upgrades | Barracks |
| T1 Tech | Engineering Bay | 125/0 | Missile Turret; Infantry upgrades | Command Center |
| Defense | Bunker | 100/0 | Garrison infantry | Barracks |
| Defense | Missile Turret | 75/0 | Static anti-air; Detector | Engineering Bay |
| T2 | Factory | 200/100 | Vulture; Siege Tank; Goliath | Barracks |
| T2 Add-on | Machine Shop | 50/50 | Siege Tank; Spider Mines; Siege Mode | Factory |
| T2 Tech | Armory | 100/50 | Goliath; Vehicle upgrades; Ship upgrades | Factory |
| T3 | Starport | 150/100 | Wraith; Dropship; Science Vessel; Battlecruiser; Valkyrie | Factory |
| T3 Add-on | Control Tower | 50/50 | Dropship; Science Vessel; Battlecruiser; Valkyrie | Starport |
| T3 Tech | Science Facility | 100/150 | Science Vessel; Advanced tech | Starport |
| T3 Add-on | Covert Ops | 50/50 | Ghost tech; Nuclear missile path | Science Facility |
| T3 Add-on | Physics Lab | 50/50 | Battlecruiser | Science Facility |
| T3 Add-on | Nuclear Silo | 100/100 | Nuclear missile | Command Center + Covert Ops |

## Terran Units

| Producer | Unit | Cost M/G | Supply | Required Tech | Ground Power | Air Power | Combat Type / Notes |
|---|---:|---:|---:|---|---:|---:|---|
| Command Center | SCV | 50/0 | 1 | — | 5 N | — | Worker |
| Barracks | Marine | 50/0 | 1 | — | 6 N | 6 N | Ranged infantry |
| Barracks | Firebat | 50/25 | 1 | Academy | 16 C/S | — | Close-range splash infantry |
| Barracks | Medic | 50/25 | 1 | Academy | — | — | Healer / support |
| Barracks | Ghost | 25/75 | 1 | Academy + Science Facility + Covert Ops | 10 C | 10 C | Caster; Cloak; Nuke caller |
| Factory | Vulture | 75/0 | 2 | — | 20 C | — | Fast anti-small ground unit |
| Factory | Spider Mine | Free with upgrade | — | Machine Shop upgrade | 125 E/S | — | Deployed by Vulture |
| Factory | Siege Tank | 150/100 | 2 | Machine Shop | 30 E / 70 E/S siege | — | Siege artillery |
| Factory | Goliath | 100/50 | 2 | Armory | 12 N | 20 E | Anti-air mech |
| Starport | Wraith | 150/100 | 2 | — | 8 N | 20 E | Cloakable fighter |
| Starport | Dropship | 100/100 | 2 | Control Tower | — | — | Transport |
| Starport | Science Vessel | 100/225 | 2 | Control Tower + Science Facility | — | — | Detector; Caster |
| Starport | Battlecruiser | 400/300 | 6 | Control Tower + Physics Lab | 25 N | 25 N | Capital ship |
| Starport | Valkyrie | 250/125 | 3 | Control Tower + Armory | — | 6 E/S | Brood War anti-air splash |

---

# Zerg

## Zerg Production Model

Zerg units are primarily produced from `Larva`.
- `Hatchery`, `Lair`, and `Hive` generate Larva.
- Tech buildings unlock which units Larva can morph into.
- Some advanced units are morphs from existing units.

## Zerg Building / Tech Tree

| Tier | Building | Cost M/G | Unlocks / Produces | Prerequisite |
|---|---:|---:|---|---|
| Base | Hatchery | 300/0 | Larva; Drone; Overlord; tech to Lair | — |
| Base | Extractor | 50/0 | Gas income | Vespene geyser |
| Base | Creep Colony | 75/0 | Morphs to Sunken Colony or Spore Colony | Hatchery |
| T1 | Spawning Pool | 200/0 | Zergling; Sunken Colony; Zergling upgrades | Hatchery |
| T1 Tech | Evolution Chamber | 75/0 | Spore Colony; Ground upgrades | Hatchery |
| Defense | Sunken Colony | +50/0 | Static ground defense | Creep Colony + Spawning Pool |
| Defense | Spore Colony | +50/0 | Static anti-air; Detector | Creep Colony + Evolution Chamber |
| T1.5 | Hydralisk Den | 100/50 | Hydralisk; Lurker Aspect research | Spawning Pool |
| T2 | Lair | 150/100 | Mutalisk; Scourge; Queen; tech to Hive | Hatchery + Spawning Pool |
| T2 Tech | Spire | 200/150 | Mutalisk; Scourge; morph to Greater Spire | Lair |
| T2 Tech | Queen's Nest | 150/100 | Queen; required for Hive | Lair |
| T3 | Hive | 200/150 | Ultralisk; Defiler; Guardian / Devourer path | Lair + Queen's Nest |
| T3 Tech | Greater Spire | 100/150 | Guardian; Devourer morphs | Hive + Spire |
| T3 Tech | Ultralisk Cavern | 150/200 | Ultralisk | Hive |
| T3 Tech | Defiler Mound | 100/100 | Defiler | Hive |
| Utility | Nydus Canal | 150/0 | Map transport | Hive |

## Zerg Units

| Producer / Morph Source | Unit | Cost M/G | Supply | Required Tech | Ground Power | Air Power | Combat Type / Notes |
|---|---:|---:|---:|---|---:|---:|---|
| Hatchery Larva | Drone | 50/0 | 1 | — | 5 N | — | Worker |
| Hatchery Larva | Overlord | 100/0 | 0 | — | — | — | Supply; Detector after upgrade |
| Hatchery Larva | Zergling | 25/0 | 0.5 | Spawning Pool | 5 N | — | Fast melee swarm |
| Hatchery Larva | Hydralisk | 75/25 | 1 | Hydralisk Den | 10 E | 10 E | Ranged ground/air |
| Hydralisk morph | Lurker | +50/+100 | 2 | Lurker Aspect | 20 S | — | Burrowed line splash |
| Lair Larva | Mutalisk | 100/100 | 2 | Spire | 9 N bounce | 9 N bounce | Air harassment |
| Lair Larva | Scourge | 12/38 | 0.5 | Spire | — | 110 N | Suicide anti-air |
| Lair Larva | Queen | 100/100 | 2 | Queen's Nest | — | — | Caster |
| Mutalisk morph | Guardian | +50/+100 | 2 | Greater Spire | 20 N | — | Long-range air-to-ground |
| Mutalisk morph | Devourer | +150/+50 | 2 | Greater Spire | — | 25 E | Anti-air support |
| Hive Larva | Ultralisk | 200/200 | 4 | Ultralisk Cavern | 20 N | — | Heavy melee |
| Hive Larva | Defiler | 50/150 | 2 | Defiler Mound | — | — | Caster |
| Infested Command Center | Infested Terran | 100/50 | 1 | Infested Command Center | 500 E/S | — | Suicide splash |

---

# Protoss

## Protoss Production Model

Protoss units are produced from class-specific production buildings:
- `Nexus` produces workers.
- `Gateway` produces core ground units and templar.
- `Robotics Facility` produces utility and siege units.
- `Stargate` produces air units.
- Archons and Dark Archons are created by merging templar units.

## Protoss Building / Tech Tree

| Tier | Building | Cost M/G | Unlocks / Produces | Prerequisite |
|---|---:|---:|---|---|
| Base | Nexus | 400/0 | Probe | — |
| Base | Pylon | 100/0 | Supply; Power field | Nexus |
| Base | Assimilator | 100/0 | Gas income | Vespene geyser |
| T1 | Gateway | 150/0 | Zealot; Dragoon; High Templar; Dark Templar | Nexus + Pylon power |
| T1 Tech | Forge | 150/0 | Photon Cannon; Ground upgrades; Shield upgrades | Nexus |
| Defense | Photon Cannon | 150/0 | Static ground/air; Detector | Forge |
| T1.5 Tech | Cybernetics Core | 200/0 | Dragoon; Stargate path; Robotics path | Gateway |
| T2 | Robotics Facility | 200/200 | Shuttle; Reaver; Observer | Cybernetics Core |
| T2 Tech | Observatory | 50/100 | Observer | Robotics Facility |
| T2 Tech | Robotics Support Bay | 150/100 | Reaver | Robotics Facility |
| T2 | Stargate | 150/150 | Scout; Corsair; Carrier; Arbiter | Cybernetics Core |
| T2 Tech | Citadel of Adun | 150/100 | Templar Archives path; Zealot speed | Cybernetics Core |
| T2.5 Tech | Templar Archives | 150/200 | High Templar; Dark Templar; Archon; Dark Archon | Citadel of Adun |
| T3 Tech | Fleet Beacon | 300/200 | Carrier; Air upgrades | Stargate |
| T3 Tech | Arbiter Tribunal | 200/150 | Arbiter | Stargate + Templar Archives |

## Protoss Units

| Producer / Morph Source | Unit | Cost M/G | Supply | Required Tech | Ground Power | Air Power | Combat Type / Notes |
|---|---:|---:|---:|---|---:|---:|---|
| Nexus | Probe | 50/0 | 1 | — | 5 N | — | Worker |
| Gateway | Zealot | 100/0 | 2 | — | 16 N | — | Melee bruiser |
| Gateway | Dragoon | 125/50 | 2 | Cybernetics Core | 20 E | 20 E | Ranged ground/air |
| Gateway | High Templar | 50/150 | 2 | Templar Archives | — | — | Caster; merges into Archon |
| Gateway | Dark Templar | 125/100 | 2 | Templar Archives | 40 N | — | Permanent cloak; merges into Dark Archon |
| Merge | Archon | 2 High Templar | 4 | Templar Archives | 30 S | 30 S | Splash psionic attacker |
| Merge | Dark Archon | 2 Dark Templar | 4 | Templar Archives | — | — | Caster |
| Robotics Facility | Shuttle | 200/0 | 2 | — | — | — | Transport |
| Robotics Facility | Observer | 25/75 | 1 | Observatory | — | — | Cloaked detector |
| Robotics Facility | Reaver | 200/100 | 4 | Robotics Support Bay | 100 S / 125 S upgraded | — | Scarab artillery |
| Stargate | Scout | 275/125 | 3 | — | 8 N | 28 E | Air fighter |
| Stargate | Corsair | 150/100 | 2 | — | — | 5 E/S | Brood War anti-air splash |
| Stargate | Carrier | 350/250 | 6 | Fleet Beacon | 6 N/interceptor | 6 N/interceptor | Capital carrier |
| Stargate | Arbiter | 100/350 | 4 | Arbiter Tribunal | 10 E | 10 E | Cloaking aura; Caster |

---

# Cross-Faction Design Summary

| Faction | Production Logic | Design Read |
|---|---|---|
| Terran | Class-specific production buildings plus add-ons | Modular tech; add-ons create specialization gates |
| Zerg | Centralized Larva production plus decentralized tech unlocks | Expansion count multiplies production; tech determines morph options |
| Protoss | Class-specific production buildings plus expensive tech branches | Clean high-cost branches; fewer, more expensive, high-impact units |

# Source References

These are useful references for validation and deeper extraction:
- https://liquipedia.net/starcraft/Terran_Units
- https://liquipedia.net/starcraft/Terran_Unit_Statistics
- https://liquipedia.net/starcraft/Zerg_Units
- https://liquipedia.net/starcraft/Zerg_Unit_Statistics
- https://liquipedia.net/starcraft/Protoss_Units
- https://liquipedia.net/starcraft/Protoss_Unit_Statistics
- https://strategywiki.org/wiki/StarCraft/Terran_structures
