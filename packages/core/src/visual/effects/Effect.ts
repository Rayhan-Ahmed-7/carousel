import type {
  Direction,
  LayoutModel,
  NavigationMode,
  SlideVisualState,
} from "../../types/index.ts";
import type { Axis } from "../direction/Direction.ts";

export interface EffectContext {
  layout: LayoutModel;
  axis: Axis;
  activeIndex: number;
  progress: number;
  dragOffsetPx: number;
  dragDirection: Direction;
  isDragging: boolean;
  isSettling: boolean;
  slideCount: number;
  loop: NavigationMode;
  options: Record<string, unknown>;
}

export interface Effect {
  readonly name: string;
  readonly supportsMultipleSlides: boolean;
  readonly navigationMode: "page" | "slide";
  compute(ctx: EffectContext): SlideVisualState[];
}
