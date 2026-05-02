/**
 * Building - Renders a placed building with health bar
 *
 * Buildings are static structures that unlock tech or provide bonuses.
 * Now uses StarCraft visual models via GameBuildingModel.
 */

import { PlacedBuilding } from "../engine/GameState";
import { GameBuildingModel } from "./visuals/GameEntityRenderer";

interface Props {
  building: PlacedBuilding;
}

export default function Building({ building }: Props) {
  return <GameBuildingModel building={building} />;
}
