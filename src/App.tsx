/// <reference types="vite-plugin-svgr/client" />
import Wave from '@/assets/wave.svg?react'
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'

// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyB2mMKqqvId7PvMizr1olwm0wy7MJluNPA",
//   authDomain: "react-battle-ship.firebaseapp.com",
//   projectId: "react-battle-ship",
//   storageBucket: "react-battle-ship.appspot.com",
//   messagingSenderId: "862770292919",
//   appId: "1:862770292919:web:5cc5531a54815c5c5e4532"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);


function App() {
  const navigate = useNavigate();
  const handleCreateRoomClick = () => {
    navigate('/create-room');
  };
  const handleJoinRoomClick = () => {
    navigate('/join-room');
  }
  const handleGameRoomClick = () => {
    navigate('/game-room');
  }
  return (
    <div className="grid grid-rows-[1fr_2fr_1fr] grid-cols-1 h-full">
      <header className="flex flex-col justify-center items-center">
        <h1 className="text-4xl">Battle Ship</h1>
      </header>

      <main className="flex justify-center items-center gap-8">
        <Button onClick={handleCreateRoomClick} size="lg">Create Room</Button>
        <Button onClick={handleJoinRoomClick} size="lg">Join Room</Button>
        <Button onClick={handleGameRoomClick} size="lg">Game Room</Button>
      </main>

      <footer>
        <Wave />
      </footer>      
    </div>
  )
}

export default App
