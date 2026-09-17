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

export class CardEffect implements Effect {
  readonly name = 'card'
  readonly layout = { positioning: 'slides', height: 'content' } as const
  readonly supportsMultipleSlides = false
  readonly navigationMode = 'slide' as const
  readonly loopStrategy = 'circular' as const

  compute(ctx: EffectContext): SlideVisualState[] {
    const perSlideOffset = n(ctx.options.perSlideOffset, 8)
    const perSlideRotate = n(ctx.options.perSlideRotate, 5)
    const dragRotate = n(ctx.options.dragRotate, 20)
    const dragScale = Math.min(0.3, Math.max(0, n(ctx.options.dragScale, 0.2)))
    const dragTravelRatio = Math.min(
      0.8,
      Math.max(0.5, n(ctx.options.dragTravelRatio, 0.65)),
    )
    const handoffThreshold = Math.min(
      1,
      Math.max(0.01, n(ctx.options.handoffThreshold, 0.5)),
    )
    const limitProgress = Math.max(1, n(ctx.options.limitProgress, 4))
    const cardWidthRatio = Math.min(
      1,
      Math.max(0.5, n(ctx.options.cardWidthRatio, 0.72)),
    )
    const cardInsetRatio = Math.min(
      0.25,
      Math.max(0, n(ctx.options.cardInsetRatio, 0.07)),
    )
    const rotate = ctx.options.rotate !== false
    const cardWidth = ctx.layout.containerSize * cardWidthRatio
    const cardInset = ctx.layout.containerSize * cardInsetRatio
    const cardPosition =
      (ctx.layout.containerSize - cardWidth) / 2 + cardInset
    const stride = ctx.layout.slideSize + ctx.layout.gap
    const dragProgress = stride > 0 ? ctx.dragOffsetPx / stride : 0
    const handoffProgress = Math.min(
      1,
      (Math.abs(ctx.dragOffsetPx) * dragTravelRatio) /
        Math.max(1, cardWidth),
    )
    const handoffActive =
      (ctx.isDragging || ctx.isSettling) && handoffProgress >= handoffThreshold
    const isDraggingForward = ctx.dragDirection === 'next' && dragProgress !== 0
    const isDraggingBackward = ctx.dragDirection === 'previous' && dragProgress !== 0

    const slides: SlideVisualState[] = []
    for (let i = 0; i < ctx.slideCount; i++) {
      const progress = loopOffset(i, ctx.progress, ctx.slideCount, ctx.loop === 'infinite')
      const isCurrent = i === ctx.activeIndex
      const isIncoming =
        (isDraggingForward && i === (ctx.activeIndex + 1) % ctx.slideCount) ||
        (isDraggingBackward && i === (ctx.activeIndex - 1 + ctx.slideCount) % ctx.slideCount)
      const state = base(i)
      if (ctx.axis instanceof HorizontalAxis) {
        state.width = cardWidth
      } else {
        state.width = ctx.layout.crossSize
      }
      state.position = 'absolute'
      state.transformOrigin = isCurrent && handoffProgress > 0
        ? 'center center'
        : 'bottom left'

      if (isCurrent) {
        // The top card follows the finger in either direction.
        const travel = -ctx.dragOffsetPx * dragTravelRatio
        const dragAmount = Math.min(1, Math.abs(dragProgress))
        const easedDrag = dragAmount * dragAmount * (3 - 2 * dragAmount)
        ctx.axis.apply(state, travel)
        if (rotate) state.rotateZ = -dragProgress * dragRotate
        state.scale = 1 - dragScale * easedDrag
        state.zIndex = handoffActive
          ? ctx.slideCount - 1
          : ctx.slideCount + 1
        state.opacity = 1
        state.visible = true
      } else if (Math.abs(progress) <= limitProgress) {
        // Cards fan away from the active card on their respective side.
        const depth = Math.abs(progress)
        const side = progress < 0 ? -1 : 1
        const stackOffset = side * perSlideOffset * depth
        ctx.axis.apply(state, stackOffset)
        if (rotate) state.rotateZ = side * depth * perSlideRotate
        state.scale = Math.max(0.88, 1 - depth * 0.03)
        state.translateZ = -16 * depth
        state.zIndex = isIncoming && handoffActive
          ? ctx.slideCount
          : Math.max(0, ctx.slideCount - Math.ceil(depth))
        state.opacity = 1
        state.visible = true
      } else {
        // Cards that have left the deck or are beyond the visible range.
        ctx.axis.apply(state, progress * ctx.layout.containerSize)
        if (rotate) state.rotateZ = progress * perSlideRotate
        state.translateZ = -100 * Math.abs(progress)
        state.opacity = 0
        state.visible = false
        state.zIndex = 0
      }

      if (ctx.axis instanceof HorizontalAxis) state.translateX += cardPosition
      else state.translateY += cardPosition

      slides.push(state)
    }
    return slides
  }
}
