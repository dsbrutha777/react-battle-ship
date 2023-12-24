import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { CustomizedAlertDialog } from "@/components/ui/customized-alert-dialog";
import { Grid } from "@/components/ui/grid";
import { useBlocker, useParams, useNavigate } from 'react-router-dom';
import { onValue, ref } from "firebase/database";
import { useToast } from "@/components/ui/use-toast";
import { IPlayer } from "@/interfaces"
import { RoomStatus } from "@/enums"
import { GRID_SIZE } from "@/utility/constants";
import FirebaseService from "@/services/firebaseService";

function GameRoom() {
    
    const leaveFlgRef = useRef<boolean>(false);
    const [_, setRoomStatus] = useState<string>(RoomStatus.READY);
    const [player, setPlayer] = useState<IPlayer | null>(null);
    const [opponent, setOpponent] = useState<IPlayer | null>(null);
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState<boolean>(false);
    const blocker = useBlocker(({ currentLocation, nextLocation }) => currentLocation.pathname !== nextLocation.pathname && nextLocation.pathname !== '/');
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const firebaseService = useMemo(() => new FirebaseService(), []);

    // ===== useCallback ===== //
    const handleCancelClick = useCallback((blocker: any) => {
        blocker.reset();
    }, []);
    const handleConfirmClick = useCallback(async () => {
        if (roomId) {
            leaveFlgRef.current = true;
            // 刪除玩家
            const playerIds = (await firebaseService.getPlayersInSameRoom(roomId)).map(player => player.id);
            const removePlayersPromises = playerIds.map(playerId => firebaseService.removePlayer(playerId));
            
            await Promise.all(removePlayersPromises);

            // 刪除房間
            await firebaseService.removeRoom(roomId);

        }
    }, [roomId]);
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

    // 若房間不存在，則導回首頁
    useEffect(() => {
        const db = firebaseService.getDb();
        const roomRef = ref(db, `rooms/${roomId}`);
        return onValue(roomRef, (snapshot) => {
            if (!snapshot.exists()) {
                if (!leaveFlgRef.current) {
                    toast({
                        title: "The room is not exist.",
                        description: "Haha! Your oppenont is a coward!",
                    });
                }
                leaveFlgRef.current = false; // reset

                navigate('/');
            }
        });
    }, [roomId]);

    // 監聽房間狀態
    useEffect(() => {
        const db = firebaseService.getDb();
        const roomStatusRef = ref(db, `rooms/${roomId}/status`);
        return onValue(roomStatusRef, (snapshot) => {
            setRoomStatus(snapshot.val());
        });
    }, [roomId]);

    // 取得玩家資料
    useEffect(() => {
        if (roomId) {
            const execute = async () => {
                const playerId = sessionStorage.getItem('playerId') || '';
                const players = await firebaseService.getPlayersInSameRoom(roomId);
                const opponentId = players.find(player => player.id !== playerId)?.id || '';
    
                setPlayer(await firebaseService.getPlayer(playerId));
                setOpponent(await firebaseService.getPlayer(opponentId));
            };
            execute();
        }
    }, []);
    useEffect(() => {
        return onValue(ref(firebaseService.getDb(), `players/${opponent?.id}/status`), (snapshot) => {
            if (snapshot.exists()) {
                console.log(snapshot.val());
                setOpponent((prev) => {
                    if (prev) {
                        return {
                            ...prev,
                            status: snapshot.val()
                        }
                    }
                    return prev;
                });
            }
        });
    }, [opponent?.status]);
    return (
        <>
            <div className="w-full flex flex-col justify-center items-center gap-10">
                <div className="flex flex-row items-end justify-center ml-3 gap-10">
                    <span className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-500">{player?.name}</span>
                    <span className="text-3xl">vs</span>
                    <span className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">{opponent?.name}</span>
                </div>
                <div className="flex flex-row justify-start gap-24">
                    {player && opponent && <Grid player={player} opponent={opponent} size={GRID_SIZE} />}
                    {player && opponent && <Grid player={player} opponent={opponent} size={GRID_SIZE} mask={true} />}
                </div>
                
            </div>
            <CustomizedAlertDialog
                isOpen={isAlertDialogOpen}
                title="Go Back to Home Page?"
                desc="Are you sure you want to go back to home page?"
                handleCancelClick={() => handleCancelClick(blocker)}
                handleConfirmClick={handleConfirmClick}
            />
        </>
    )
}

export default GameRoom;