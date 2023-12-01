import { useEffect, useState, useCallback , useMemo} from "react";
import { useBlocker, useParams } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { ref, remove, getDatabase } from "firebase/database";
import { firebaseConfig } from "@/firebase-config";

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

function CreateRoom() {
  const params = useParams();
  const db = useMemo(() => getDatabase(app), []);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  let blocker = useBlocker(({ currentLocation, nextLocation }) => currentLocation.pathname !== nextLocation.pathname);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setIsAlertDialogOpen(true);
    }
  }, [blocker]);

  const handleBlockerCancelClick = useCallback((blocker: any) => {
    blocker.reset();
  }, []);
  const handleBlockerContinueClick = useCallback(async (blocker: any) => {
    const { roomId } = params;
    const roomsRef = ref(db, `rooms/${roomId}`);
    await remove(roomsRef);

    blocker.proceed();
  }, []);

  return (
    <>
    <div className="flex justify-center">
      <h1 className="text-5xl">{params.roomId}</h1>
    </div>
    <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave Room {params.roomId}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to leave and remove the room?
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

export default CreateRoom;