/// <reference types="vite-plugin-svgr/client" />
import { useState, useCallback } from 'react'
import Wave from '@/assets/wave.svg?react'
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"

import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set } from "firebase/database";
import { firebaseConfig } from "@/firebase-config";

import { RoomModel } from "@/models"
import { RoomStatus } from "@/enums";
import { v4 as uuidv4 } from 'uuid';
import { genRamdomRoomNumber } from "@/utility/utils";

const app = initializeApp(firebaseConfig);

function App() {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleCreateRoomClick = async () => {
    // Create Room
    const roomId = uuidv4();
    const roomNumber = genRamdomRoomNumber();
    const db = getDatabase(app);
    const roomsRef = ref(db, `rooms/${roomNumber}`);

    const snapshot = await get(roomsRef);
    if (snapshot.exists()) {
      handleCreateRoomClick();
      return;
    }
    
    const data = {
      id: roomId,
      name: roomNumber,
      players: [],
      status: RoomStatus.WAIT
    };
    const newRoom = new RoomModel(data);
    await set(roomsRef, newRoom);

    navigate(`/create-room/${newRoom.name}`);
  };
  const handleJoinRoomClick = () => {
    navigate('/join-room');
  }
  const handleGameRoomClick = () => {
    navigate('/game-room');
  }
  const handleNameChange = useCallback((e: any) => {
    setName(e.target.value);
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
          <Button className="font-black" onClick={handleCreateRoomClick} size="lg" disabled={!Boolean(name)}>Create Room</Button>
          <Button className="font-black" onClick={handleJoinRoomClick} size="lg" disabled={!Boolean(name)}>Join Room</Button>
          <Button className="font-black" onClick={handleGameRoomClick} size="lg" disabled={!Boolean(name)}>Game Room</Button>
        </div>
      </main>

      <footer>
        <Wave />
      </footer>
    </div>
  )
}

export default App
