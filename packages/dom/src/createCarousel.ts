import { Carousel, type CarouselOptions } from '@carousel/core'
import { DOMMeasurements, measurementsDiffer } from './DOMMeasurements'
import { applyCarouselDOMDefaults, applyContentHeight, applyTrackLayout, DOMRenderer } from './DOMRenderer'
import { PointerEventAdapter } from './PointerEventAdapter'
import { KeyboardAdapter } from './KeyboardAdapter'
import { FocusManager } from './FocusManager'
import { ResizeObserverAdapter } from './ResizeObserverAdapter'

export interface DOMBindingElements {
  root: HTMLElement
  viewport: HTMLElement
  track: HTMLElement
  slides: HTMLElement[]
}

export interface DOMBindingOptions {
  drag?: boolean
  keyboard?: boolean
  useWillChange?: boolean
  perspective?: number | false
  touchAction?: string
}

export function createCarousel(
  els: DOMBindingElements,
  options: CarouselOptions,
  bindingOptions: DOMBindingOptions = {}
): { carousel: Carousel; destroy: () => void } {
  const { drag = true, keyboard = true, useWillChange = true, perspective = 1200, touchAction } = bindingOptions

  const measurer = new DOMMeasurements()
  const renderer = new DOMRenderer({ useWillChange })
  const pointer = new PointerEventAdapter()
  const keys = new KeyboardAdapter()
  const focus = new FocusManager()
  const resize = new ResizeObserverAdapter()
  const measurements = measurer.measure({ viewport: els.viewport, slides: els.slides })
  const carousel = new Carousel({ drag, ...options }, { measurements, viewportWidth: window.innerWidth })
  const effectLayout = carousel.getEffectLayout()
  applyCarouselDOMDefaults(
    els,
    options.axis ?? 'horizontal',
    perspective,
    effectLayout.positioning,
    drag,
    touchAction,
  )
  els.root.classList.toggle('carousel-root-track', effectLayout.positioning === 'track')
  applyTrackLayout(els, effectLayout.positioning)
  applyContentHeight(els, effectLayout, measurements.containerHeight)

  focus.attach(els.root)

  const unsub = carousel.events.on('render', (model) => {
    renderer.render(els.slides, model, els.track)
  })

  if (drag) {
    carousel.bindInteraction()
    pointer.attach(els.viewport, {
      onDown: (s) => carousel.pointerDown(s),
      onMove: (s) => carousel.pointerMove(s),
      onUp: () => carousel.pointerUp(),
    })
  }

  if (keyboard) {
    keys.attach(els.root, {
      onNext: () => carousel.next(),
      onPrevious: () => carousel.previous(),
      onFirst: () => carousel.goTo(0, true),
      onLast: () => carousel.goTo(Math.max(0, carousel.getState().slideCount - 1), true),
    })
  }

  resize.observe(els.viewport, () => {
    const m = measurer.measure({ viewport: els.viewport, slides: els.slides })
    applyContentHeight(els, effectLayout, m.containerHeight)
    carousel.updateMeasurements(m)
  })

  const initial = carousel.getRenderModel()
  if (initial) renderer.render(els.slides, initial, els.track)

  const fittedMeasurements = measurer.measure({ viewport: els.viewport, slides: els.slides })
  if (measurementsDiffer(fittedMeasurements, measurements)) carousel.updateMeasurements(fittedMeasurements)

  return {
    carousel,
    destroy() {
      unsub()
      renderer.destroy()
      pointer.detach()
      keys.detach()
      focus.detach()
      resize.disconnect()
      els.root.classList.remove('carousel-root-track')
      carousel.destroy()
    },
  }
}
