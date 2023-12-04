import { RoomStatus } from "@/enums";

export interface IPlayer {
  id: string;
  name: string;
  status: string;
}
export interface ICell {
  x: string;
  y: string;
  value: string; // the initial value is 0. if there is a value, it is the length of the ship.
  index: number;
  isHit: boolean
}
export interface IRoom {
  id: string;
  players: string[]; // player id
  status: RoomStatus;
}