import { useState, useCallback, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { initializeApp } from "firebase/app";
import { ref, set, get, getDatabase } from "firebase/database";
import { firebaseConfig } from "@/firebase-config";
import { useToast } from "@/components/ui/use-toast"
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RoomStatus } from '@/enums';
import { v4 as uuidv4 } from 'uuid';
import { PlayerModel } from '@/models';


const app = initializeApp(firebaseConfig);

function JoinRoom() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast()
  const navigate = useNavigate();
  const db = useMemo(() => getDatabase(app), []);
  const [roomId, setRoomId] = useState('');

  // 將時間格式化的邏輯提取為一個函數
  const formatCurrentDateTime = () => {
    const now = new Date();
    return `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  };

// 新增函數處理房間加入邏輯
  const handleRoomJoining = async (roomId: string, newPlayer: PlayerModel) => {
    const roomsRef = ref(db, `rooms/${roomId}`);
    const snapshot = await get(roomsRef);

    if (!snapshot.exists()) {
      toast({
        title: "Room not found!",
        description: formatCurrentDateTime(),
      });
      return; // 早期返回以減少嵌套
    }

    const existingPlayers = snapshot.val().players;
    // const newPlayer = new PlayerModel({ id: uuidv4(), name: playerName || '' });

    // 更新 Firebase 中的房間信息
    set(roomsRef, {
      ...snapshot.val(),
      players: [...existingPlayers, newPlayer],
      status: RoomStatus.PLAYING
    });

    // 顯示成功信息並導航到遊戲房間
    toast({
      title: "Let's start the game!",
      description: formatCurrentDateTime(),
    });
    navigate(`/game-room/${roomId}`);
  };

  const handleJoinRoomClick = useCallback(async () => {
    // const playerName = searchParams.get('playerName') || '';
    const playerId = sessionStorage.getItem('playerId') || '';

    const db = getDatabase(app);
    const playerRef = ref(db, `players/${playerId}`);
    const snapshot = await get(playerRef);
    const player = new PlayerModel(snapshot.val());
    
    handleRoomJoining(roomId, player).catch(error => {
      console.error('Error joining room:', error);
    });
  }, [roomId, searchParams]);
  const handleRoomChangeChange = useCallback((e: any) => {
    setRoomId(e.target.value);
  }, [roomId]);
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <Input placeholder="Enter Room Number" onChange={handleRoomChangeChange} className="w-1/2" />
      <Button onClick={handleJoinRoomClick} disabled={!Boolean(roomId)}>Join Room</Button>
    </div>
  );
}

export default JoinRoom;