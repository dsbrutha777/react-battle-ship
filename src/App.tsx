import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from '@/components/ui/mode-toggle'
import LandingPage from '@/components/pages/landing-page'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex flex-col p-3 h-full">
          <div className="self-end h-auto">
            <ModeToggle />
          </div>
          <LandingPage />
        </div>
    </ThemeProvider>
  )
}

export default App
