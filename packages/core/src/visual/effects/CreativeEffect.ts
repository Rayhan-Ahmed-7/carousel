import type { SlideVisualState } from '../../types/index'
import { loopOffset, type Effect, type EffectContext } from './Effect'
import { HorizontalAxis } from '../direction/HorizontalAxis'

export interface CreativeSideOptions {
  translate?: [number, number, number];
  rotate?: [number, number, number];
  scale?: number;
  opacity?: number;
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

function n(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

const DEFAULT_PREVIOUS: Required<CreativeSideOptions> = {
  translate: [-120, 0, -200],
  rotate: [0, 0, -12],
  scale: 1,
  opacity: 0.4,
}

const DEFAULT_NEXT: Required<CreativeSideOptions> = {
  translate: [120, 0, -200],
  rotate: [0, 0, 12],
  scale: 1,
  opacity: 0.4,
}

export class CreativeEffect implements Effect {
  readonly name = 'creative'
  readonly layout = { positioning: 'slides', height: 'content' } as const
  readonly supportsMultipleSlides = true
  readonly navigationMode = 'slide' as const
  readonly loopStrategy = 'circular' as const

  compute(ctx: EffectContext): SlideVisualState[] {
    const prev = {
      ...DEFAULT_PREVIOUS,
      ...((ctx.options.prev ?? {}) as CreativeSideOptions),
    }
    const next = {
      ...DEFAULT_NEXT,
      ...((ctx.options.next ?? {}) as CreativeSideOptions),
    }
    const cardSize = ctx.layout.slideSize
    const centerOffset = (ctx.layout.containerSize - cardSize) / 2
    const slides: SlideVisualState[] = []
    for (let i = 0; i < ctx.slideCount; i++) {
      const d = loopOffset(i, ctx.progress, ctx.slideCount, ctx.loop === 'infinite')
      const t = Math.max(-1, Math.min(1, d))
      const factor = Math.abs(t)
      const target = t < 0 ? prev : next

      const tr = target.translate ?? [0, 0, 0]
      const ro = target.rotate ?? [0, 0, 0]
      const sc = n(target.scale, 1)
      const op = n(target.opacity, 1)

      const state = base(i)
      if (ctx.axis instanceof HorizontalAxis) {
        state.width = cardSize
      } else {
        state.width = ctx.layout.crossSize
      }
      state.position = 'absolute'
      state.translateX = tr[0] * factor
      state.translateY = tr[1] * factor
      state.translateZ = tr[2] * factor
      state.rotateX = ro[0] * factor
      state.rotateY = ro[1] * factor
      state.rotateZ = ro[2] * factor
      state.scale = 1 + (sc - 1) * factor
      state.opacity = 1 + (op - 1) * factor
      if (ctx.axis instanceof HorizontalAxis) state.translateX += centerOffset
      else state.translateY += centerOffset
      state.zIndex = Math.round(500 - Math.abs(d) * 10)
      state.visible = Math.abs(d) < 2
      slides.push(state)
    }
    return slides
  }
}
