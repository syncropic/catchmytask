import { LandingPage } from '@/pages/Landing'
import { AppPage } from '@/pages/App'
import { DocsPage } from '@/pages/Docs'
import { PricingPage } from '@/pages/Pricing'

export function App() {
  const path = window.location.pathname
  if (path === '/app' || path.startsWith('/app/')) {
    return <AppPage />
  }
  if (path === '/docs' || path.startsWith('/docs/')) {
    return <DocsPage />
  }
  if (path === '/pricing' || path.startsWith('/pricing/')) {
    return <PricingPage />
  }
  return <LandingPage />
}
