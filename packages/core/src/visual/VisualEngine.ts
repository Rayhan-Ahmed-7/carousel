import type {
  Direction,
  LayoutModel,
  RenderModel,
  SlideVisualState,
} from "../types/index.ts";
import type { AxisStrategy } from "./direction/Direction.ts";
import { HorizontalAxis } from "./direction/HorizontalAxis.ts";
import type { Effect } from "./effects/Effect.ts";
import type { Modifier } from "./modifiers/Modifier.ts";

export interface VisualInput {
  layout: LayoutModel;
  axis: AxisStrategy;
  effect: Effect;
  modifiers: Modifier[];
  slideCount: number;
  activeIndex: number;
  progress: number;
  dragOffsetPx: number;
  dragDirection: Direction;
  isDragging: boolean;
  isSettling: boolean;
  effectOptions: Record<string, unknown>;
  loop: "finite" | "infinite" | "rewind";
}

export class VisualEngine {
  compute(input: VisualInput): RenderModel {
    const ctx = {
      layout: input.layout,
      axis: input.axis,
      activeIndex: input.activeIndex,
      progress: input.progress,
      dragOffsetPx: input.dragOffsetPx,
      dragDirection: input.dragDirection,
      isDragging: input.isDragging,
      isSettling: input.isSettling,
      slideCount: input.slideCount,
      loop: input.loop,
      options: input.effectOptions,
    };
    let states: SlideVisualState[] = input.effect.compute(ctx);
    for (const state of states) {
      if (state.width == null && input.axis instanceof HorizontalAxis) {
        state.width = input.layout.slideSize;
      }
      if (state.height == null && input.axis instanceof HorizontalAxis) {
        state.height = input.layout.crossSize;
      }
      if (state.width == null && !(input.axis instanceof HorizontalAxis)) {
        state.width = input.layout.crossSize;
      }
      if (state.height == null && !(input.axis instanceof HorizontalAxis)) {
        state.height = input.layout.slideSize;
      }
    }
    for (const mod of input.modifiers) {
      states = mod.apply(states, ctx);
    }
    return {
      slides: states,
      logicalSlideCount: input.slideCount,
      loopCopies:
        input.slideCount > 0
          ? Math.max(1, Math.round(states.length / input.slideCount))
          : 1,
      trackTranslate: { x: 0, y: 0 },
    };
  }
}
