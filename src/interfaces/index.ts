import { ShipSize } from "@/enums";

export interface ICell {
    x: string;
    y: string;
    index: number;
    isHit: boolean
}
export interface IShip {
  name: string;
  size: ShipSize;
  cells: ICell[];
}
