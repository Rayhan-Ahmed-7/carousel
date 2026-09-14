import type { SlideVisualState } from '../../types/index'
import { loopOffset, type Effect, type EffectContext } from './Effect'

export class FlipEffect implements Effect {
  readonly name = 'flip'
  readonly supportsMultipleSlides = false
  readonly navigationMode = 'slide' as const
  readonly loopStrategy = 'circular' as const

  compute(ctx: EffectContext): SlideVisualState[] {
    const slides: SlideVisualState[] = []
    for (let i = 0; i < ctx.slideCount; i++) {
      const d = loopOffset(i, ctx.progress, ctx.slideCount, ctx.loop === 'infinite')
      const rotateY = d * 180
      const abs = Math.abs(d)
      const opacity = abs < 1 ? 1 : 0
      slides.push({
        index: i,
        translateX: 0,
        translateY: 0,
        translateZ: 0,
        rotateX: 0,
        rotateY,
        rotateZ: 0,
        scale: 1,
        opacity,
        zIndex: Math.round(500 - abs * 10),
        visible: abs < 1,
      })
    }
    return slides
  }
}
