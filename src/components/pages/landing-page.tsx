/// <reference types="vite-plugin-svgr/client" />
import { Button } from '@/components/ui/button'
import BattleShip from '@/assets/battleship.svg?react'
import Wave from '@/assets/wave.svg?react'

function LandingPage() {

  return (
    <div className="grid grid-rows-[1fr_3fr_1fr] grid-cols-1 h-full">
      <header className="flex flex-col justify-center items-center">
        <h1 className="text-4xl">Battle Ship</h1>
      </header>

      <main className="flex flex-row justify-center items-center">
        <Wave className="max-h-96" />
        <BattleShip className="max-h-96" />
        <Wave className="max-h-96" />
      </main>

      <footer className="flex flex-row justify-center items-center gap-x-3 relative">
        <Button>CREATE</Button>
        <Button>SEARCH</Button>
      </footer>

      
    </div>
    )
}

export default LandingPage
