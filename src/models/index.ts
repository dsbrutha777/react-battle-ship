import { IRoom, IPlayer, ICell } from '@/interfaces';
import { RoomStatus } from '@/enums';
export class RoomModel {
  public id: string;
  public status: RoomStatus;
  public players: string[]; // player id
  public round: string
  constructor(raw: IRoom) {
    this.id = raw.id;
    this.status = raw.status;
    this.players = raw.players;
    this.round = raw.round;
  }
}
export class PlayerModel {
  public id: string;
  public name: string;
  public status: string;
  public cells: ICell[];
  constructor(raw: IPlayer) {
    this.id = raw.id;
    this.name = raw.name;
    this.status = raw.status;
    this.cells = raw.cells;
  }
}
export class CellModel {
  public x: string;
  public y: string;
  public value: string; // the initial value is 0. if there is a value, it is the length of the ship.
  public isHit: boolean;
  constructor(raw: ICell) {
    this.x = raw.x;
    this.y = raw.y;
    this.value = raw.value;
    this.isHit = raw.isHit;
  }
}
