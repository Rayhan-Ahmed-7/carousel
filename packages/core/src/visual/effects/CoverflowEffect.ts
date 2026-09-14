import type { SlideVisualState } from '../../types/index'
import { loopOffset, type Effect, type EffectContext } from './Effect'
import { HorizontalAxis } from '../direction/HorizontalAxis'

function n(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

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

export class CoverflowEffect implements Effect {
  readonly name = 'coverflow'
  readonly supportsMultipleSlides = true
  readonly navigationMode = 'slide' as const
  readonly loopStrategy = 'circular' as const

  compute(ctx: EffectContext): SlideVisualState[] {
    const rotate = n(ctx.options.rotate, 40)
    const depth = n(ctx.options.depth, 120)
    const spacing = n(ctx.options.spacing, 0.55)
    const stretch = n(ctx.options.stretch, 0)
    const singleSlideWidth = n(ctx.options.singleSlideWidth, 0.72)
    const visibleRange = n(
      ctx.options.visibleRange,
      Math.max(1, ctx.layout.slidesPerView / 2),
    )
    const rotationLimit = n(ctx.options.rotationLimit, 1.5)
    const cardSize =
      ctx.layout.slidesPerView === 1
        ? ctx.layout.containerSize * singleSlideWidth
        : ctx.layout.slideSize
    const stride = cardSize + ctx.layout.gap
    const centerOffset = (ctx.layout.containerSize - cardSize) / 2
    const slides: SlideVisualState[] = []
    for (let i = 0; i < ctx.slideCount; i++) {
      const d = loopOffset(i, ctx.progress, ctx.slideCount, ctx.loop === 'infinite')
      const abs = Math.abs(d)
      const clamped = Math.max(-rotationLimit, Math.min(rotationLimit, d))
      const state = base(i)
      if (ctx.axis instanceof HorizontalAxis) {
        state.width = cardSize
        state.height = ctx.layout.crossSize
      } else {
        state.width = ctx.layout.crossSize
        state.height = cardSize
      }
      ctx.axis.apply(
        state,
        centerOffset + d * stride * spacing + stretch * clamped,
      )
      state.translateZ = -Math.min(abs, 2) * depth
      if (ctx.axis instanceof HorizontalAxis) {
        state.rotateY = -clamped * rotate
      } else {
        state.rotateX = clamped * rotate
      }
      state.opacity = Math.max(0.35, 1 - Math.max(0, abs - 1) * 0.35)
      state.zIndex = Math.round(500 - abs * 10)
      state.visible = abs <= visibleRange
      slides.push(state)
    }
    return slides
  }
}
