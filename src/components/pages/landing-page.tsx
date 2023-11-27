import { Button } from '@/components/ui/button'
import BattleShip from '@/assets/battleship.svg'

function LandingPage() {

  return (
    <div className="grid grid-rows-[1fr_3fr_1fr] grid-cols-1 h-full">
      <header className="flex flex-col justify-center items-center">
        <h1 className="text-4xl">Battle Ship</h1>
      </header>

      <main className="flex flex-col justify-center items-center">
        <img src={BattleShip} alt="battleship" className="max-h-96" />
      </main>

      <footer className="flex flex-col justify-center items-center">
        <Button>footer</Button>
      </footer>
    </div>
    )
}

export default LandingPage
