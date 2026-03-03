import { LandingPage } from '@/pages/Landing'
import { AppPage } from '@/pages/App'

export function App() {
  const path = window.location.pathname
  if (path === '/app' || path.startsWith('/app/')) {
    return <AppPage />
  }
  return <LandingPage />
}
