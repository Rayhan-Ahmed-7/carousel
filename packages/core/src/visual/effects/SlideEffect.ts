import type { SlideVisualState } from '../../types/index'
import type { Effect, EffectContext } from './Effect'

export class SlideEffect implements Effect {
  readonly name = 'slide'
  readonly supportsMultipleSlides = true
  readonly navigationMode = 'page' as const
  readonly loopStrategy = 'physicalCopies' as const

  compute(ctx: EffectContext): SlideVisualState[] {
    const stride = ctx.layout.slideSize + ctx.layout.gap
    const slides: SlideVisualState[] = []
    const usesLoopCopies =
      ctx.loop === 'infinite' && ctx.slideCount > 1 && ctx.layout.slidesPerView > 1
    const copies = usesLoopCopies ? [-1, 0, 1] : [0]

    for (const copy of copies) {
      for (let i = 0; i < ctx.slideCount; i++) {
        const state: SlideVisualState = {
          index: i,
          loopCopy: copy,
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
        let progressOffset = i + copy * ctx.slideCount - ctx.progress
        if (!usesLoopCopies && ctx.loop === 'infinite' && ctx.slideCount > 1) {
          const half = ctx.slideCount / 2
          while (progressOffset > half) progressOffset -= ctx.slideCount
          while (progressOffset < -half) progressOffset += ctx.slideCount
        }
        ctx.axis.apply(state, progressOffset * stride)
        slides.push(state)
      }
    }
    return slides
  }
}
