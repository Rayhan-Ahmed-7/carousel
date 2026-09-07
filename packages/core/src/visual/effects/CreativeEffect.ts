import type { SlideVisualState } from "../../types/index.ts";
import type { Effect, EffectContext } from "./Effect.ts";

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
  };
}

function n(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export class CreativeEffect implements Effect {
  readonly name = "creative";
  readonly supportsMultipleSlides = true;
  readonly navigationMode = "slide" as const;

  compute(ctx: EffectContext): SlideVisualState[] {
    const prev = (ctx.options.prev ?? {}) as CreativeSideOptions;
    const next = (ctx.options.next ?? {}) as CreativeSideOptions;
    const slides: SlideVisualState[] = [];
    for (let i = 0; i < ctx.slideCount; i++) {
      const d = i - ctx.progress;
      const t = Math.max(-1, Math.min(1, d));
      const factor = Math.abs(t);
      const target = t < 0 ? prev : next;

      const tr = target.translate ?? [0, 0, 0];
      const ro = target.rotate ?? [0, 0, 0];
      const sc = n(target.scale, 1);
      const op = n(target.opacity, 1);

      const state = base(i);
      state.translateX = tr[0] * factor;
      state.translateY = tr[1] * factor;
      state.translateZ = tr[2] * factor;
      state.rotateX = ro[0] * factor;
      state.rotateY = ro[1] * factor;
      state.rotateZ = ro[2] * factor;
      state.scale = 1 + (sc - 1) * factor;
      state.opacity = 1 + (op - 1) * factor;
      state.zIndex = Math.round(500 - Math.abs(d) * 10);
      state.visible = Math.abs(d) < 2;
      slides.push(state);
    }
    return slides;
  }
}
