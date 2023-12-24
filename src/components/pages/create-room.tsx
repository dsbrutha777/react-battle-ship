import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useBlocker, useNavigate } from "react-router-dom";
import { CustomizedAlertDialog } from "@/components/ui/customized-alert-dialog";
import { RoomStatus } from "@/enums";
import { ref, onValue } from "firebase/database";

import FirebaseService from "@/services/firebaseService";

function CreateRoom() {
    const navigate = useNavigate();
    const blocker = useBlocker(({ currentLocation, nextLocation }) => currentLocation.pathname !== nextLocation.pathname && nextLocation.pathname !== `/game-room/${roomId}`);
    const { roomId } = useParams();
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState<boolean>(false);

    const firebaseService = useMemo(() => new FirebaseService(), []);

    // ===== useCallback ===== //
    const handleCancelClick = useCallback((blocker: any) => {
        blocker.reset();
    }, []);
    const handleConfirmClick = useCallback(async (blocker: any) => {
        const playerId = sessionStorage.getItem("playerId") || '';
        Promise.all([
            await firebaseService.removePlayer(playerId),
            await firebaseService.removeRoom(roomId)
        ])
        // remove player id from session storage
        sessionStorage.removeItem("playerId");
        
        blocker.proceed();
    }, []);

    // ===== useEffect ===== //
    useEffect(() => {
        // blocker.state: 'unblocked' | 'blocked' | 'proceeding'
        if (blocker.state === 'blocked') {
            setIsAlertDialogOpen(true);
        }

        if (blocker.state === 'unblocked') {
            setIsAlertDialogOpen(false);
        }
    }, [blocker]);
    useEffect(() => {
        const db = firebaseService.getDb();
        const roomStatusRef = ref(db, `rooms/${roomId}/status`);
        return onValue(roomStatusRef, (snapshot) => {
            const roomStatus = snapshot.val();
            if (roomStatus === RoomStatus.READY) {
                navigate(`/game-room/${roomId}`);
            }
        })
    }, []);
    return (
        <>
            <div className="w-full flex flex-col justify-center items-center">
                <h1 className="text-5xl">{roomId}</h1>
            </div>
            <CustomizedAlertDialog
                isOpen={isAlertDialogOpen}
                title={`Leave Room ${roomId}?`}
                desc="Are you sure you want to leave and remove the room?"
                handleCancelClick={() => handleCancelClick(blocker)}
                handleConfirmClick={() => handleConfirmClick(blocker)}
            />
        </>
    )
}

export default CreateRoom

// 從這邊開始，先做當點下回上一頁時要把房間與玩家資料刪除