import { RoomStatus } from "@/enums";

export interface IPlayer {
  id: string;
  name: string;
  status: string;
  cells: ICell[];
}
export interface ICell {
  x: string;
  y: string;
  value: string; // the initial value is 0. if there is a value, it is the length of the ship.
  isHit: boolean
}
export interface IRoom {
  id: string;
  players: string[]; // player id
  status: RoomStatus;
  round: string
}