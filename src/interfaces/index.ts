import { ShipSize } from "@/enums";
import { RoomStatus } from "@/enums";

export interface IPlayer {
  id: string;
  name: string;
}
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
export interface IRoom {
  id: string;
  name: string;
  players: IPlayer[];
  status: RoomStatus;
}