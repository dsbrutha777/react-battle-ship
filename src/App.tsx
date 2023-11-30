/// <reference types="vite-plugin-svgr/client" />
import Wave from '@/assets/wave.svg?react'
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'

import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, child } from "firebase/database";
import { firebaseConfig } from "@/firebase-config";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db);

get(child(dbRef, '/')).then((snapshot) => {
  if (snapshot.exists()) {
    console.log(snapshot.val());
  } else {
    console.log("No data available");
  }
});

function App() {
  const navigate = useNavigate();
  const handleCreateRoomClick = () => {
    navigate('/create-room');
  };
  const handleJoinRoomClick = () => {
    navigate('/join-room');
  }
  const handleGameRoomClick = () => {
    navigate('/game-room');
  }
  return (
    <div className="grid grid-rows-[1fr_2fr_1fr] grid-cols-1 h-full">
      <header className="flex flex-col justify-center items-center">
        <h1 className="text-5xl font-black">Battle Ship</h1>
      </header>

      <main className="flex justify-center items-center gap-8">
        <Button className="font-black" onClick={handleCreateRoomClick} size="lg">Create Room</Button>
        <Button className="font-black" onClick={handleJoinRoomClick} size="lg">Join Room</Button>
        <Button className="font-black" onClick={handleGameRoomClick} size="lg">Game Room</Button>
      </main>

      <footer>
        <Wave />
      </footer>      
    </div>
  )
}

export default App
