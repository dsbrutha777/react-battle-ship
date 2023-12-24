import { initializeApp } from "firebase/app";
import { getDatabase, Database, ref, remove, set, get } from "firebase/database";
import { firebaseConfig } from "@/firebase-config";

import { IRoom, IPlayer } from "@/interfaces"
import { RoomStatus, PlayerStatus } from "@/enums"
import { genRamdomRoomId, getCoordinates } from "@/utility/utils";
import { GRID_SIZE } from "@/utility/constants";

import { v4 as uuidv4 } from "uuid";

class FirebaseService {
    private db: Database;
    constructor() {
        const app = initializeApp(firebaseConfig)
    
        this.db = getDatabase(app);
    }
    public getDb() {
        return this.db;
    }
    public getPlayer(id: string): Promise<IPlayer> {
        const playerRef = ref(this.db, `players/${id}`);
        return get(playerRef).then((snapshot) => {
            if (snapshot.exists()) {
                return snapshot.val();
            } else {
                return null;
            }
        }).catch((error) => {
            console.error(error);
            return null;
        });
    }
    public async getPlayersInSameRoom(roomId: string): Promise<IPlayer[]> {
        const roomPlayersRef = ref(this.db, `rooms/${roomId}/players`);
        const roomPlayersSnapshot = await get(roomPlayersRef);
        const roomPlayers = roomPlayersSnapshot.val();

        const players: IPlayer[] = [];
        for (let i = 0; i < roomPlayers.length; i++) {
            const playerRef = ref(this.db, `players/${roomPlayers[i]}`);
            const playerSnapshot = await get(playerRef);
            const player = playerSnapshot.val();
            players.push(player);
        }

        return players;
    }
    public async removePlayer(id: string) {
        if (!id) {
            console.error("id is null");
            return;
        }

        // remove player
        const playerRef = ref(this.db, `players/${id}`);
        await remove(playerRef);

        sessionStorage.removeItem("playerId");
    }
    public async removeRoom(id: string | undefined) {
        if (!id) {
            console.error("id is undefined");
            return;
        }

        // remove room
        const roomRef = ref(this.db, `rooms/${id}`);
        await remove(roomRef);
    }
    public async createPlayer(playerName: string): Promise<IPlayer> {
        const playerId = uuidv4();
        const playerRef = ref(this.db, `players/${playerId}`);
        const newPlayer: IPlayer = {
            id: playerId,
            name: playerName,
            status: PlayerStatus.PREPARE,
            cells: Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
              const [x, y] = getCoordinates(GRID_SIZE, index);
              const value = '0';
              const isHit = false;
              return { x, y, value, isHit };
            }),
        }
        await set(playerRef, newPlayer);

        // set player id to session storage
        sessionStorage.setItem("playerId", playerId);
        
        return newPlayer;
    }
    public async createRoom(playerId: string): Promise<IRoom> {
        const roomId = genRamdomRoomId();
        const roomRef = ref(this.db, `rooms/${roomId}`);
        const roomSnapshot = await get(roomRef);
        if (roomSnapshot.exists()) {
            return this.createRoom(playerId);
        }

        const newRoom: IRoom = {
          id: roomId,
          players: [playerId],
          status: RoomStatus.PREPARE,
          round: '',
        }
        await set(roomRef, newRoom);

        return newRoom;
    }
    public async joinRoom(roomId: string, playerId: string): Promise<boolean> {
        const roomRef = ref(this.db, `rooms/${roomId}`);
        const roomSnapshot = await get(roomRef);

        if (!roomSnapshot.exists()) {
            return false;
        }

        // 新玩家加入房間
        const roomPlayersRef = ref(this.db, `rooms/${roomId}/players`);
        const roomPlayersSnapshot = await get(roomPlayersRef);
        const roomPlayers = roomPlayersSnapshot.val();
        await set(roomPlayersRef, [...roomPlayers, playerId]);
        
        // 變更房間狀態
        const roomStatusRef = ref(this.db, `rooms/${roomId}/status`)
        await set(roomStatusRef, RoomStatus.READY);

        return true;
    }
    public async setCells(playerId: string, corrdinates: { x: string, y: string}[], value: string): Promise<void> {
        const playerRef = ref(this.db, `players/${playerId}`);
        const playerSnapshot = await get(playerRef);
        const player = playerSnapshot.val();
        const cellIndex = player.cells.findIndex((cell: any) => {
            return corrdinates.some((corrdinate) => {
                return cell.x === corrdinate.x && cell.y === corrdinate.y;
            });
        });
        player.cells[cellIndex].value = value;
        await set(playerRef, player);
    }
    public async removeCells(playerId: string, value: string): Promise<void> {
        const playerRef = ref(this.db, `players/${playerId}`);
        const playerSnapshot = await get(playerRef);
        const player = playerSnapshot.val();
        
        for (let i = 0; i < player.cells.length; i++) {
            if (player.cells[i].value === value) {
                player.cells[i].value = '0';
            }
        }
        
        await set(playerRef, player);
    }
    public async setPlayerStatus(playerId: string, status: PlayerStatus): Promise<void> {
        const playerRef = ref(this.db, `players/${playerId}`);
        const playerSnapshot = await get(playerRef);
        const player = playerSnapshot.val();
        player.status = status;
        await set(playerRef, player);
    }
}

export default FirebaseService;