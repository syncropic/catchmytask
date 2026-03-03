import { Navigation } from '@/sections/Navigation'
import { Hero } from '@/sections/Hero'
import { ValueProps } from '@/sections/ValueProps'
import { Features } from '@/sections/Features'
import { HowItWorks } from '@/sections/HowItWorks'
import { Principles } from '@/sections/Principles'
import { Install } from '@/sections/Install'
import { Footer } from '@/sections/Footer'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navigation />
      <Hero />
      <ValueProps />
      <Features />
      <HowItWorks />
      <Principles />
      <Install />
      <Footer />
    </div>
  )
}
