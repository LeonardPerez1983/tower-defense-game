/**
 * Generic CSV loader with header validation.
 *
 * Files in data/ are served at root by Vite (publicDir = "../data"),
 * so data/config.csv is fetched as /config.csv.
 */

export interface CsvRow {
  [column: string]: string;
}

export async function loadCsv(
  path: string,
  requiredColumns?: string[]
): Promise<CsvRow[]> {
  const res = await fetch(`/${path}`);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  const text = await res.text();
  const lines = text.trim().split("\n");
  if (lines.length === 0) throw new Error(`${path} is empty`);

  const header = lines[0].split(",").map((h) => h.trim());

  // Fail-fast: validate required columns
  if (requiredColumns) {
    for (const col of requiredColumns) {
      if (!header.includes(col)) {
        throw new Error(`${path}: missing required column "${col}"`);
      }
    }
  }

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row: CsvRow = {};
    header.forEach((col, i) => {
      row[col] = values[i]?.trim() ?? "";
    });
    return row;
  });
}

export async function loadConfig(): Promise<Map<string, string>> {
  const rows = await loadCsv("config.csv", ["key", "value"]);
  return new Map(rows.map((r) => [r.key, r.value]));
}

// Card data types
export interface Card {
  id: string;
  name: string;
  cost: number;
  effect_type: "spawn_unit" | "spawn_building" | "damage" | "heal" | "stun" | "add_worker" | "upgrade_building";
  effect_value: string; // For upgrade_building, this is the target building type (e.g., "creep_colony")
  unit_id: string;
  building_id: string; // For upgrade_building, this is the upgraded building type (e.g., "sunken_colony")
  card_type: "unit" | "building" | "spell" | "upgrade";
  faction: "terran" | "zerg" | "protoss" | "neutral";
  description: string;
  max_copies: number;
  is_permanent_removal: boolean;
  discard_cost: number;
  build_time: number;
}

export async function loadCards(): Promise<Card[]> {
  const rows = await loadCsv("cards.csv", ["id", "name", "cost", "effect_type", "card_type", "faction", "description", "max_copies", "is_permanent_removal", "discard_cost", "build_time"]);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    cost: parseFloat(r.cost),
    effect_type: r.effect_type as Card["effect_type"],
    effect_value: r.effect_value || "", // String for upgrade target
    unit_id: r.unit_id || "",
    building_id: r.building_id || "",
    card_type: r.card_type as Card["card_type"],
    faction: r.faction as Card["faction"],
    description: r.description,
    max_copies: parseInt(r.max_copies),
    is_permanent_removal: r.is_permanent_removal === "true",
    discard_cost: parseFloat(r.discard_cost),
    build_time: parseFloat(r.build_time),
  }));
}

// Unit stats types
export interface UnitStats {
  id: string;
  health: number;
  max_shields: number;
  shield_regen_delay: number; // seconds
  shield_regen_rate: number; // shields per second
  speed: number;
  damage: number;
  attack_range: number;
  shape: "box" | "sphere" | "cylinder" | "cone";
  color: string;
  faction: "terran" | "zerg" | "protoss" | "neutral";
}

export async function loadUnits(): Promise<UnitStats[]> {
  const rows = await loadCsv("units.csv", [
    "id", "health", "speed", "damage", "attack_range", "shape", "color", "faction",
    "max_shields", "shield_regen_delay", "shield_regen_rate"
  ]);
  return rows.map((r) => ({
    id: r.id,
    health: parseFloat(r.health),
    max_shields: parseFloat(r.max_shields),
    shield_regen_delay: parseFloat(r.shield_regen_delay),
    shield_regen_rate: parseFloat(r.shield_regen_rate),
    speed: parseFloat(r.speed),
    damage: parseFloat(r.damage),
    attack_range: parseFloat(r.attack_range),
    shape: r.shape as UnitStats["shape"],
    color: r.color,
    faction: r.faction as UnitStats["faction"],
  }));
}

// Building data types
export interface Building {
  id: string;
  name: string;
  cost: number;
  health: number;
  max_shields: number;
  shield_regen_delay: number; // seconds
  shield_regen_rate: number; // shields per second
  attack_damage: number; // 0 = no attack
  attack_range: number; // 0 = no attack
  attack_cooldown: number; // seconds, 0 = use default
  shape: "box" | "sphere" | "cylinder" | "cone";
  color: string;
  width: number;
  height: number;
  depth: number;
  description: string;
}

export async function loadBuildings(): Promise<Building[]> {
  const rows = await loadCsv("buildings.csv", [
    "id", "name", "cost", "health", "max_shields", "shield_regen_delay", "shield_regen_rate",
    "attack_damage", "attack_range", "attack_cooldown",
    "shape", "color", "width", "height", "depth", "description"
  ]);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    cost: parseFloat(r.cost),
    health: parseFloat(r.health),
    max_shields: parseFloat(r.max_shields),
    shield_regen_delay: parseFloat(r.shield_regen_delay),
    shield_regen_rate: parseFloat(r.shield_regen_rate),
    attack_damage: parseFloat(r.attack_damage),
    attack_range: parseFloat(r.attack_range),
    attack_cooldown: parseFloat(r.attack_cooldown),
    shape: r.shape as Building["shape"],
    color: r.color,
    width: parseFloat(r.width),
    height: parseFloat(r.height),
    depth: parseFloat(r.depth),
    description: r.description,
  }));
}

// Tech tree data types
export interface TechTreeEntry {
  card_id: string;
  required_building: string; // "none" means always available
  faction: "terran" | "zerg" | "protoss";
}

export async function loadTechTree(): Promise<TechTreeEntry[]> {
  const rows = await loadCsv("tech_tree.csv", ["card_id", "required_building", "faction"]);
  return rows.map((r) => ({
    card_id: r.card_id,
    required_building: r.required_building,
    faction: r.faction as TechTreeEntry["faction"],
  }));
}
