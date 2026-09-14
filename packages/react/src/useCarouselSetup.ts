import { useContext } from 'react'
import { CarouselSetupContext, type CarouselSetupContextValue } from './context'

export function useCarouselSetup(): CarouselSetupContextValue {
  const ctx = useContext(CarouselSetupContext)
  if (!ctx) throw new Error('Carousel subcomponents must be used within <Carousel>')
  return ctx
}
