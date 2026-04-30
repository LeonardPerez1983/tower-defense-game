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
  effect_type: "spawn_unit" | "damage" | "heal" | "stun";
  effect_value: number;
  unit_id: string;
  description: string;
}

export async function loadCards(): Promise<Card[]> {
  const rows = await loadCsv("cards.csv", ["id", "name", "cost", "effect_type", "description"]);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    cost: parseFloat(r.cost),
    effect_type: r.effect_type as Card["effect_type"],
    effect_value: parseFloat(r.effect_value) || 0,
    unit_id: r.unit_id || "",
    description: r.description,
  }));
}

// Unit stats types
export interface UnitStats {
  id: string;
  health: number;
  speed: number;
  damage: number;
  attack_range: number;
  shape: "box" | "sphere" | "cylinder" | "cone";
  color: string;
}

export async function loadUnits(): Promise<UnitStats[]> {
  const rows = await loadCsv("units.csv", ["id", "health", "speed", "damage", "attack_range", "shape", "color"]);
  return rows.map((r) => ({
    id: r.id,
    health: parseFloat(r.health),
    speed: parseFloat(r.speed),
    damage: parseFloat(r.damage),
    attack_range: parseFloat(r.attack_range),
    shape: r.shape as UnitStats["shape"],
    color: r.color,
  }));
}
