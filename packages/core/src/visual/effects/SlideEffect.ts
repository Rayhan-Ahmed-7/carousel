import type { SlideVisualState } from "../../types/index.ts";
import type { Effect, EffectContext } from "./Effect.ts";

export class SlideEffect implements Effect {
  readonly name = "slide";
  readonly supportsMultipleSlides = true;
  readonly navigationMode = "page" as const;

  compute(ctx: EffectContext): SlideVisualState[] {
    const stride = ctx.layout.slideSize + ctx.layout.gap;
    const slides: SlideVisualState[] = [];
    for (let i = 0; i < ctx.slideCount; i++) {
      const state: SlideVisualState = {
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
        let progressOffset = i - ctx.progress;
        if (ctx.loop === "infinite" && ctx.slideCount > 1) {
          const half = ctx.slideCount / 2;
          while (progressOffset > half) progressOffset -= ctx.slideCount;
          while (progressOffset < -half) progressOffset += ctx.slideCount;
        }
        const offset = progressOffset * stride;
      ctx.axis.apply(state, offset);
      slides.push(state);
    }
    return slides;
  }
}
