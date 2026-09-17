import type { Measurements } from '@carousel/core'

export interface DOMMeasurementInput {
  viewport: HTMLElement
  slides: HTMLElement[] | HTMLCollection | NodeListOf<Element>
}

export function measurementsDiffer(a: Measurements, b: Measurements): boolean {
  return (
    a.containerWidth !== b.containerWidth || a.containerHeight !== b.containerHeight || a.slideCount !== b.slideCount
  )
}

export class DOMMeasurements {
  measure(input: DOMMeasurementInput): Measurements {
    const rect = input.viewport.getBoundingClientRect()
    const slides = Array.from(input.slides) as HTMLElement[]
    const track = slides[0]?.parentElement
    const viewportHeight = input.viewport.style.height
    const trackHeight = track?.style.height
    const slideHeights = slides.map((slide) => slide.style.height)

    let contentHeight = 0
    try {
      input.viewport.style.height = 'auto'
      if (track) track.style.height = 'auto'
      slides.forEach((slide) => {
        slide.style.height = 'auto'
      })

      contentHeight = slides.reduce((height, slide) => Math.max(height, slide.scrollHeight), 0)
    } finally {
      input.viewport.style.height = viewportHeight
      if (track) track.style.height = trackHeight ?? ''
      slides.forEach((slide, index) => {
        slide.style.height = slideHeights[index] ?? ''
      })
    }

    const count = slides.length
    return {
      containerWidth: rect.width,
      containerHeight: contentHeight || rect.height,
      slideCount: count,
    }
  }
}
