import { useCallback, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";


interface TopBarProps {
    children: ReactNode;
}

export function TopBar({ children }: TopBarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const visibileClassName = useMemo(() => location.pathname === '/' ? 'invisible' : 'visible', [location.pathname]);
    const handleBackClick = useCallback(async () => {
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