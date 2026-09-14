import type { CSSProperties } from 'react'
import { useCarouselOptional } from './useCarousel'
import { useCarouselState } from './useCarouselState'

export interface CarouselPaginationProps {
  className?: string;
  style?: CSSProperties;
  dotClassName?: string;
  activeDotClassName?: string;
  dotStyle?: CSSProperties;
  activeDotStyle?: CSSProperties;
}

export function CarouselPagination(props: CarouselPaginationProps) {
  const carousel = useCarouselOptional()
  const state = useCarouselState()
  if (state.navigationCount <= 0) return null
  const dots: number[] = []
  for (let i = 0; i < state.navigationCount; i++) dots.push(i)
  return (
    <div className={props.className} style={props.style} role="tablist">
      {dots.map((i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === Math.min(state.activeIndex, state.navigationCount - 1)}
          aria-label={`Go to slide ${i + 1}`}
          className={
            i === Math.min(state.activeIndex, state.navigationCount - 1)
              ? props.activeDotClassName
              : props.dotClassName
          }
          style={
            i === Math.min(state.activeIndex, state.navigationCount - 1)
              ? props.activeDotStyle
              : props.dotStyle
          }
          onClick={() => carousel?.goTo(i, true, 'next')}
        />
      ))}
    </div>
  )
}
