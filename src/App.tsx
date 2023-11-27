import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from './components/ui/mode-toggle'

function App() {

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ModeToggle></ModeToggle>
      Hello World!
    </ThemeProvider>
  )
}

export default App
