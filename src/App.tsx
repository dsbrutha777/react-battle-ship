/// <reference types="vite-plugin-svgr/client" />
import Wave from '@/assets/wave.svg?react'
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'

function App() {
  const navigate = useNavigate();
  const handleCreateRoomClick = () => {
    navigate('/create-room');
  };
  const handleJoinRoomClick = () => {
    navigate('/join-room');
  }
  return (
    <div className="grid grid-rows-[1fr_2fr_1fr] grid-cols-1 h-full">
      <header className="flex flex-col justify-center items-center">
        <h1 className="text-4xl">Battle Ship</h1>
      </header>

      <main className="flex justify-center items-center gap-8">
        <Button onClick={handleCreateRoomClick} size="lg">Create Room</Button>
        <Button onClick={handleJoinRoomClick} size="lg">Join Room</Button>
      </main>

      <footer>
        <Wave />
      </footer>      
    </div>
  )
}

export default App
