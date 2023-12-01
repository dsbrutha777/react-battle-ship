import { useCallback, useMemo } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import { initializeApp } from "firebase/app";
import { getDatabase, ref, remove } from "firebase/database";
import { firebaseConfig } from "@/firebase-config";

interface TopBarProps {
    children: ReactNode;
}

const app = initializeApp(firebaseConfig);

export function TopBar({ children }: TopBarProps) {
    const db = useMemo(() => getDatabase(app), []);
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const visibileClassName = useMemo(() => location.pathname === '/' ? 'invisible' : 'visible', [location.pathname]);
    const handleBackClick = useCallback(async () => {
        const currentRoute = location.pathname.split('/')[1]; // create-room
        switch(currentRoute) {
            case 'create-room':
                const { roomId } = params;
                const roomsRef = ref(db, `rooms/${roomId}`);
                await remove(roomsRef);
                break;
            default: break;
        }

        navigate(-1);
    }, [location.pathname, navigate]);
    return (
        <>
            <div className="flex justify-between p-3">
                <Button variant="ghost" size="icon" onClick={handleBackClick} className={visibileClassName}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <ModeToggle />
            </div>
            {children}
        </>
    );
}