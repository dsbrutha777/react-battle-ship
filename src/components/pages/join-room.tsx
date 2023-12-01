import { useState, useCallback, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { initializeApp } from "firebase/app";
import { ref, set, get, getDatabase } from "firebase/database";
import { firebaseConfig } from "@/firebase-config";
import { useToast } from "@/components/ui/use-toast"
import { useNavigate } from 'react-router-dom';
import { RoomStatus } from '@/enums';


const app = initializeApp(firebaseConfig);

function JoinRoom() {
  const { toast } = useToast()
  const navigate = useNavigate();
  const db = useMemo(() => getDatabase(app), []);
  const [roomNumber, setRoomNumber] = useState('');
  const handleJoinRoomClick = useCallback(async () => {
    const roomsRef = ref(db, `rooms/${roomNumber}`);
    const snapshot = await get(roomsRef);
    const now = new Date();
    if (snapshot.exists()) {
      set(roomsRef, { ...snapshot.val(), status: RoomStatus.PLAYING});

      toast({
        title: "Let's start the game!",
        description: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
      });
      navigate(`/game-room/${roomNumber}`);
    } else {
      toast({
        title: "Room not found!",
        description: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
      });
    }

  }, [roomNumber]);
  const handleRoomChangeChange = useCallback((e: any) => {
    setRoomNumber(e.target.value);
  }, [roomNumber]);
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <Input placeholder="Enter Room Number" onChange={handleRoomChangeChange} className="w-1/2" />
      <Button onClick={handleJoinRoomClick} disabled={!Boolean(roomNumber)}>Join Room</Button>
    </div>
  );
}

export default JoinRoom;