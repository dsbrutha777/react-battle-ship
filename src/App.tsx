import { useState, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import FirebaseService from '@/services/firebaseService'

function App() {
  const firebaseService = useMemo(()=> new FirebaseService(), []);
  const navigate = useNavigate();

  // useState
  const [name, setName] = useState<string>("");

  // useCallback
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);
  const handleCreateRoomClick = useCallback(async () => {
    // create player
    const player = await firebaseService.createPlayer(name);
   
    // create room
    const room = await firebaseService.createRoom(player.id)
    
    navigate(`/create-room/${room.id}`);
  }, [name]);

  const handleJoinRoomClick = useCallback(async () => {
    // create player
    await firebaseService.createPlayer(name);

    navigate("/join-room");
  }, [name]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="min-w-[400px] flex flex-col justify-center items-center gap-10">
        <h1 className="text-5xl">Battle Ship</h1>
        <Input placeholder="Enter your name" onChange={handleNameChange} />
        <div className="w-full flex flex-row gap-5 justify-center">
          <Button className="flex-1" disabled={!name} onClick={handleCreateRoomClick}>Create Room</Button>
          <Button className="flex-1" disabled={!name} onClick={handleJoinRoomClick}>Join Room</Button>
        </div>
      </div>
    </div>
  )
}

export default App
