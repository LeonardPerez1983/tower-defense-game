/**
 * Unit - Individual 3D unit component
 *
 * Renders a unit based on its stats.
 * Now uses StarCraft visual models via GameUnitModel.
 */

import { Unit as UnitData } from "../engine/GameState";
import { GameUnitModel } from "./visuals/GameEntityRenderer";

interface Props {
  unit: UnitData;
}

export default function Unit({ unit }: Props) {
  return <GameUnitModel unit={unit} />;
}
