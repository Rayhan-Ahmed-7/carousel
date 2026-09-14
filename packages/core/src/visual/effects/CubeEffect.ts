import type { SlideVisualState } from '../../types/index'
import { loopOffset, type Effect, type EffectContext } from './Effect'

function base(i: number): SlideVisualState {
  return {
    index: i,
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    scale: 1,
    opacity: 1,
    zIndex: 0,
    visible: true,
  }
}

export class CubeEffect implements Effect {
  readonly name = 'cube'
  readonly supportsMultipleSlides = false
  readonly navigationMode = 'slide' as const
  readonly loopStrategy = 'circular' as const

  compute(ctx: EffectContext): SlideVisualState[] {
    const isH = true
    const half = ctx.layout.slideSize / 2
    const slides: SlideVisualState[] = []
    for (let i = 0; i < ctx.slideCount; i++) {
      const d = loopOffset(i, ctx.progress, ctx.slideCount, ctx.loop === 'infinite')
      const angle = d * 90
      const state = base(i)
      const axis = isH ? 'rotateY' : 'rotateX'
      state.transform =
        `translateZ(${-half}px) ${axis}(${angle}deg) translateZ(${half}px)`
      const abs = Math.abs(d)
      state.opacity = abs <= 1 ? 1 : Math.max(0, 1 - (abs - 1))
      state.zIndex = Math.round(500 - abs * 10)
      state.visible = abs <= 1.5
      slides.push(state)
    }
    return slides
  }
}
