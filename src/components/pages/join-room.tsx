import { useState, useCallback, useMemo, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { initializeApp } from "firebase/app";
import { ref, set, get, remove, getDatabase } from "firebase/database";
import { firebaseConfig } from "@/firebase-config";
import { useToast } from "@/components/ui/use-toast"
import { useNavigate, useSearchParams, useBlocker } from 'react-router-dom';
import { RoomStatus } from '@/enums';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"

const app = initializeApp(firebaseConfig);

function JoinRoom() {
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => currentLocation.pathname !== nextLocation.pathname);
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
  const handleRoomJoining = async (roomId: string, newPlayerId: string) => {
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

    // 更新 Firebase 中的房間信息
    set(roomsRef, {
      ...snapshot.val(),
      players: [...existingPlayers, newPlayerId],
      status: RoomStatus.READY
    });

    // 顯示成功信息並導航到遊戲房間
    toast({
      title: "Let's start the game!",
      description: formatCurrentDateTime(),
    });
    navigate(`/game-room/${roomId}`);
  };

  const handleJoinRoomClick = useCallback(async () => {
    const playerId = sessionStorage.getItem('playerId') || '';
    
    handleRoomJoining(roomId, playerId).catch(error => {
      console.error('Error joining room:', error);
    });
  }, [roomId, searchParams]);
  const handleRoomChangeChange = useCallback((e: any) => {
    setRoomId(e.target.value);
  }, [roomId]);
  const handleBlockerCancelClick = useCallback((blocker: any) => {
    blocker.reset();
  }, []);
  const handleBlockerContinueClick = useCallback((blocker: any) => {
    const playerRef = ref(db, `players/${sessionStorage.getItem('playerId')}`);

    remove(playerRef).then(() => {
      sessionStorage.removeItem('playerId');
      blocker.proceed();
    });
    
  }, []);
  
  // useEffect
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setIsAlertDialogOpen(true);
    }
  }, [blocker]);
  
  return (
    <>
      <div className="flex flex-col justify-center items-center gap-4">
        <Input placeholder="Enter Room Number" onChange={handleRoomChangeChange} className="w-1/2" />
        <Button onClick={handleJoinRoomClick} disabled={!Boolean(roomId)}>Join Room</Button>
      </div>
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Back To Index Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove your info?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleBlockerCancelClick(blocker)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleBlockerContinueClick(blocker)}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default JoinRoom;