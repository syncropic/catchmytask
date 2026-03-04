import { LandingPage } from '@/pages/Landing'
import { AppPage } from '@/pages/App'
import { DocsPage } from '@/pages/Docs'

export function App() {
  const path = window.location.pathname
  if (path === '/app' || path.startsWith('/app/')) {
    return <AppPage />
  }
  if (path === '/docs' || path.startsWith('/docs/')) {
    return <DocsPage />
  }
  return <LandingPage />
}
