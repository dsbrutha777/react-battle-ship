import { useState, useEffect, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { CustomizedAlertDialog } from "../ui/customized-alert-dialog";
import { useBlocker, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast"

import FirebaseService from '@/services/firebaseService'

function JoinRoom() {
    const [roomId, setRoomId] = useState<string>('');
    const navigate = useNavigate();
    const blocker = useBlocker(({ currentLocation, nextLocation }) => currentLocation.pathname !== nextLocation.pathname && nextLocation.pathname !== `/game-room/${roomId}`);
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState<boolean>(false);
    const { toast } = useToast();
    const firebaseService = useMemo(() => new FirebaseService(), []);

    // ===== useCallback ===== //
    const handleRoomIdChange = useCallback((e: any) => {
        setRoomId(e.target.value);
    }, []);
    const handleJoinRoomClick = useCallback(async () => {
        const playerId = sessionStorage.getItem('playerId') || '';
        const isJoinRoom = await firebaseService.joinRoom(roomId, playerId);
        if (isJoinRoom) {
            navigate(`/game-room/${roomId}`);
        } else {
            toast({
                title: "Room not found!",
                description: "This Room is not exist.",
            });
        }

    }, [roomId]);
    const handleCancelClick = useCallback((blocker: any) => {
        blocker.reset();
    }, []);
    const handleConfirmClick = useCallback((blocker: any) => {
        const playerId = sessionStorage.getItem("playerId") || '';
        firebaseService.removePlayer(playerId);

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
    return (
        <>
            <div className="w-full flex flex-col justify-center items-center">
                <div className="min-w-[400px] flex flex-col justify-center items-center gap-10">
                    <h1 className="text-5xl">Join Room</h1>
                    <Input placeholder="Enter Room ID" onChange={handleRoomIdChange} />
                    <div className="w-full flex flex-row">
                        <Button className="flex-1" disabled={!roomId} onClick={handleJoinRoomClick}>Join</Button>
                    </div>
                </div>
            </div>
            <CustomizedAlertDialog
                isOpen={isAlertDialogOpen}
                title="Go Back to Home Page?"
                desc="Are you sure you want to go back to home page?"
                handleCancelClick={() => handleCancelClick(blocker)}
                handleConfirmClick={() => handleConfirmClick(blocker)}
            />
        </>
    )
}

export default JoinRoom