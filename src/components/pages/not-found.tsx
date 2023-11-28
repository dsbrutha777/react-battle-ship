import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

function NotFound() {
    const navigate = useNavigate();
    const handleGoBackClick = () => {
        navigate('/');
    };
    return (
        <div className="flex flex-col h-full justify-center items-center gap-4">
            <h1 className="text-slate-400 text-4xl">404</h1>
            <p className="text-slate-500 text-3xl">Page Not Found</p>
            <Button onClick={handleGoBackClick}>Go Home!</Button>
        </div>
    );
}

export default NotFound;