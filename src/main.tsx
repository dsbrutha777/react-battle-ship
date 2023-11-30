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
import { TopBar } from '@/components/ui/top-bar'
import { Toaster } from '@/components/ui/toaster'
import './index.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <TopBar><App /></TopBar>,
  },
  {
    path: '/create-room',
    element: <TopBar><CreateRoom /></TopBar>,
  },
  {
    path: '/join-room',
    element: <TopBar><JoinRoom /></TopBar>,
  },
  {
    path: '/game-room',
    element: <TopBar><GameRoom /></TopBar>,
  },
  {
    path: '*',
    element: <TopBar><NotFound /></TopBar>,
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>,
)
