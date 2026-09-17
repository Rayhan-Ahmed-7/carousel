import type { EffectLayout, RenderModel, SlideVisualState } from '@carousel/core'
import type { Axis } from '@carousel/core'

export interface CarouselDOMElements {
  viewport: HTMLElement;
  track: HTMLElement;
  slides: HTMLElement[];
}

export function applyTrackLayout(
  elements: Pick<CarouselDOMElements, 'track' | 'slides'>,
  positioning: EffectLayout['positioning'],
): void {
  if (positioning !== 'track') return

  elements.track.style.display = 'flex'
  elements.track.style.height = 'auto'
  elements.slides.forEach((slide) => {
    slide.style.position = 'relative'
    slide.style.height = 'auto'
  })
}

export function applyContentHeight(
  elements: Pick<CarouselDOMElements, 'viewport' | 'slides'>,
  layout: EffectLayout,
  contentHeight: number,
): void {
  if (layout.height !== 'content') return

  elements.slides.forEach((slide) => {
    slide.style.height = `${contentHeight}px`
  })
  if (layout.positioning === 'slides') {
    elements.viewport.style.height = `${contentHeight}px`
  }
}

function setIfUnset(element: HTMLElement, property: string, value: string): void {
  const style = element.style as unknown as Record<string, string>
  if (!style[property]) style[property] = value
}

function setIfChanged(element: HTMLElement, property: string, value: string): void {
  const style = element.style as unknown as Record<string, string>
  if (style[property] !== value) style[property] = value
}

export function applyCarouselDOMDefaults(
  elements: CarouselDOMElements,
  axis: Axis,
  perspective: number | false,
  positioning: EffectLayout['positioning'],
  drag = true,
  touchAction?: string,
): void {
  setIfUnset(elements.viewport, 'overflow', 'hidden')
  setIfUnset(elements.viewport, 'position', 'relative')
  if (drag) {
    setIfUnset(
      elements.viewport,
      'touchAction',
      touchAction ?? (axis === 'horizontal' ? 'pan-y pinch-zoom' : 'pan-x pinch-zoom'),
    )
    setIfUnset(elements.viewport, 'userSelect', 'none')
  }

  setIfUnset(elements.track, 'position', 'relative')
  setIfUnset(elements.track, 'width', '100%')
  setIfUnset(elements.track, 'height', '100%')
  setIfUnset(elements.track, 'transformStyle', 'preserve-3d')

  if (perspective !== false) {
    setIfUnset(elements.viewport, 'perspective', `${perspective}px`)
  }

  if (positioning === 'slides') {
    for (const slide of elements.slides) {
      setIfUnset(slide, 'position', 'absolute')
      setIfUnset(slide, 'top', '0')
      setIfUnset(slide, 'left', '0')
      setIfUnset(slide, 'backfaceVisibility', 'hidden')
    }
  }
}

export interface DOMRendererOptions {
  useWillChange?: boolean;
}

export class DOMRenderer {
  private opts: DOMRendererOptions
  private loopSources: HTMLElement[] = []
  private loopClones: HTMLElement[] = []

  constructor(opts: DOMRendererOptions = {}) {
    this.opts = opts
  }

  render(slides: HTMLElement[], model: RenderModel, track?: HTMLElement): void {
    if (track) {
      setIfChanged(
        track,
        'transform',
        `translate3d(${model.trackTranslate.x}px, ${model.trackTranslate.y}px, 0px)`,
      )
      setIfChanged(track, 'gap', `${model.trackGap}px`)
    }
    const renderSlides = this.materializeLoopSlides(slides, model)
    const count = Math.min(renderSlides.length, model.slides.length)
    for (let i = 0; i < count; i++) {
      const el = renderSlides[i]!
      const s = model.slides[i]!
      this.applySlide(el, s)
    }
  }

  destroy(): void {
    this.removeLoopClones()
  }

  private materializeLoopSlides(
    slides: HTMLElement[],
    model: RenderModel,
  ): HTMLElement[] {
    const usesLoopCopies =
      slides.length > 0 &&
      model.logicalSlideCount === slides.length &&
      model.loopCopies > 1 &&
      model.loopCopies % 2 === 1
    if (!usesLoopCopies) {
      this.removeLoopClones()
      return slides
    }

    const sourcesMatch =
      this.loopSources.length === slides.length &&
      this.loopSources.every((slide, index) => slide === slides[index])
    if (sourcesMatch) {
      const sideCloneCount = (model.loopCopies - 1) * slides.length / 2
      return [
        ...this.loopClones.slice(0, sideCloneCount),
        ...slides,
        ...this.loopClones.slice(sideCloneCount),
      ]
    }

    this.removeLoopClones()
    const first = slides[0]!
    const parent = first.parentElement
    if (!parent) return slides

    const sideCopyCount = (model.loopCopies - 1) / 2
    const beforeClones: HTMLElement[] = []
    const afterClones: HTMLElement[] = []
    for (let copy = 0; copy < sideCopyCount; copy++) {
      beforeClones.push(...slides.map((slide) => this.createLoopClone(slide)))
      afterClones.push(...slides.map((slide) => this.createLoopClone(slide)))
    }
    const beforeFragment = document.createDocumentFragment()
    const afterFragment = document.createDocumentFragment()
    for (const clone of beforeClones) beforeFragment.append(clone)
    for (const clone of afterClones) afterFragment.append(clone)
    parent.insertBefore(beforeFragment, first)
    parent.append(afterFragment)

    this.loopSources = [...slides]
    this.loopClones = [...beforeClones, ...afterClones]
    return [...beforeClones, ...slides, ...afterClones]
  }

  private createLoopClone(source: HTMLElement): HTMLElement {
    const clone = source.cloneNode(true) as HTMLElement
    clone.setAttribute('aria-hidden', 'true')
    clone.setAttribute('data-carousel-loop-clone', 'true')
    clone.tabIndex = -1
    for (const element of clone.querySelectorAll<HTMLElement>(
      'a, button, input, select, textarea, [tabindex]',
    )) {
      element.tabIndex = -1
    }
    return clone
  }

  private removeLoopClones(): void {
    for (const clone of this.loopClones) clone.remove()
    this.loopSources = []
    this.loopClones = []
  }

  private applySlide(el: HTMLElement, s: SlideVisualState): void {
    const transform =
      s.transform ??
      `translate3d(${s.translateX}px, ${s.translateY}px, ${s.translateZ}px)` +
      (s.rotateX ? ` rotateX(${s.rotateX}deg)` : '') +
      (s.rotateY ? ` rotateY(${s.rotateY}deg)` : '') +
      (s.rotateZ ? ` rotateZ(${s.rotateZ}deg)` : '') +
      (s.scale !== 1 ? ` scale(${s.scale})` : '')

    setIfChanged(el, 'transform', transform)
    if (s.position != null) setIfChanged(el, 'position', s.position)
    if (s.position === 'absolute') {
      setIfChanged(el, 'left', '0')
      setIfChanged(el, 'top', '0')
    } else if (s.position === 'relative') {
      setIfChanged(el, 'left', 'auto')
      setIfChanged(el, 'top', 'auto')
    }
    if (s.width != null) setIfChanged(el, 'width', `${s.width}px`)
    if (s.height != null) setIfChanged(el, 'height', `${s.height}px`)
    setIfChanged(el, 'opacity', String(s.opacity))
    setIfChanged(el, 'zIndex', String(s.zIndex))
    setIfChanged(el, 'visibility', s.visible ? 'visible' : 'hidden')
    if (s.transformOrigin != null) setIfChanged(el, 'transformOrigin', s.transformOrigin)
    if (this.opts.useWillChange) setIfChanged(el, 'willChange', 'transform, opacity')
  }
}
