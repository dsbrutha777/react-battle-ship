/// <reference types="vite-plugin-svgr/client" />
import { useState, useCallback } from 'react'
import Wave from '@/assets/wave.svg?react'
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"

import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set } from "firebase/database";
import { firebaseConfig } from "@/firebase-config";

import { IPlayer } from "@/interfaces";
import { RoomModel, PlayerModel } from "@/models"
import { RoomStatus, PlayerStatus } from "@/enums";
import { v4 as uuidv4 } from 'uuid';
import { genRamdomRoomId } from "@/utility/utils";

const app = initializeApp(firebaseConfig);

function App() {
  const [playerName, setPlayerName] = useState('');
  const navigate = useNavigate();
  const createPlayer = useCallback(async (name: string) => {
    const db = getDatabase(app);
    const id = uuidv4();
    const playersRef = ref(db, `players/${id}`);
    const param = { id, name, status: PlayerStatus.PREPARE}
    const newPlayer = new PlayerModel(param)
    await set(playersRef, newPlayer);

    sessionStorage.setItem('playerId', newPlayer.id);

    return newPlayer;
  }, []);
  const createRoom = useCallback(async (roomOwner: IPlayer) => {
    const db = getDatabase(app);
    const roomId = genRamdomRoomId();
    const roomsRef = ref(db, `rooms/${roomId}`);

    const snapshot = await get(roomsRef);
    if (snapshot.exists()) {
      createRoom(roomOwner);
      return;
    }
    
    const param = {
      id: roomId,
      players: [roomOwner.id],
      status: RoomStatus.WAIT
    };
    const newRoom = new RoomModel(param);
    await set(roomsRef, newRoom);

    return newRoom;
  }, []);
  const handleCreateRoomClick = useCallback(async () => {
    // Create Player
    const player = await createPlayer(playerName);
    // Create Room
    const room = await createRoom(player);

    navigate(`/create-room/${room?.id}`);
  }, [playerName]);
  const handleJoinRoomClick = useCallback(async () => {
    // Create Player
    await createPlayer(playerName);

    navigate(`/join-room`);
  }, [playerName]);
  const handleNameChange = useCallback((e: any) => {
    setPlayerName(e.target.value);
  }, []);
  return (
    <div className="grid grid-rows-[1fr_2fr_1fr] grid-cols-1 h-full">
      <header className="flex flex-col justify-center items-center">
        <h1 className="text-5xl font-black">Battle Ship</h1>
      </header>

      <main className="flex flex-col justify-center items-center gap-8">
        <div className="">
          <Input placeholder="Enter Your Name" onChange={handleNameChange} />
        </div>
        <div className="flex flex-row gap-8">
          <Button className="font-black" onClick={handleCreateRoomClick} size="lg" disabled={!Boolean(playerName)}>Create Room</Button>
          <Button className="font-black" onClick={handleJoinRoomClick} size="lg" disabled={!Boolean(playerName)}>Join Room</Button>
        </div>
      </main>

      <footer>
        <Wave />
      </footer>
    </div>
  )
}

export default App
