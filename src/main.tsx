import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'
import App from '@/App'
import NotFound from '@/components/pages/not-found'
import CreateRoom from './components/pages/create-room'
import GameRoom from './components/pages/game-room'
import JoinRoom from './components/pages/join-room'
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from '@/components/ui/mode-toggle'
import './index.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: '/create-room',
    element: <CreateRoom />,
  },
  {
    path: '/join-room',
    element: <JoinRoom />,
  },
  {
    path: '/game-room',
    element: <GameRoom />,
  },
  {
    path: '*',
    element: <NotFound />,
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex justify-end p-3">
        <ModeToggle />
      </div>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
)
