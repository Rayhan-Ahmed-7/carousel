import type { SlideVisualState } from "../../types/index.ts";
import type { Effect, EffectContext } from "./Effect.ts";

export class FadeEffect implements Effect {
  readonly name = "fade";
  readonly supportsMultipleSlides = false;
  readonly navigationMode = "slide" as const;

  compute(ctx: EffectContext): SlideVisualState[] {
    const slides: SlideVisualState[] = [];
    for (let i = 0; i < ctx.slideCount; i++) {
      const distance = Math.abs(i - ctx.progress);
      const opacity = Math.max(0, 1 - distance);
      slides.push({
        index: i,
        translateX: 0,
        translateY: 0,
        translateZ: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        scale: 1,
        opacity,
        zIndex: i === ctx.activeIndex ? 1 : 0,
        visible: opacity > 0,
      });
    }
    return slides;
  }
}
