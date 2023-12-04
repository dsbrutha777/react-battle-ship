import { IRoom, IPlayer } from '@/interfaces';
import { RoomStatus } from '@/enums';
export class RoomModel {
  public id: string;
  public status: RoomStatus;
  public players: string[]; // player id
  constructor(raw: IRoom) {
    this.id = raw.id;
    this.status = raw.status;
    this.players = raw.players;
  }
}
export class PlayerModel {
  public id: string;
  public name: string;
  public status: string;
  constructor(raw: IPlayer) {
    this.id = raw.id;
    this.name = raw.name;
    this.status = raw.status;
  }
}