import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { useCarouselSetup } from './useCarouselSetup'

export interface CarouselSlideProps {
  index?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export const isCarouselSlideElement = (value: ReactNode): boolean =>
  typeof value === 'object' &&
  value !== null &&
  'type' in value &&
  value.type === CarouselSlide

export function CarouselSlide({ index, className, style, children }: CarouselSlideProps) {
  const { registerSlide } = useCarouselSetup()
  const ref = useRef<HTMLDivElement | null>(null)
  const resolvedIndex = index ?? 0

  useLayoutEffect(() => {
    registerSlide(ref.current, resolvedIndex)
    return () => registerSlide(null, resolvedIndex)
  }, [resolvedIndex, registerSlide])

  return (
    <div
      ref={ref}
      className={['carousel-slide', className].filter(Boolean).join(' ')}
      data-carousel-slide-index={resolvedIndex}
      style={style}
    >
      {children}
    </div>
  )
}
