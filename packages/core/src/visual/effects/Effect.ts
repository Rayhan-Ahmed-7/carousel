import type {
  Direction,
  LayoutModel,
  LoopStrategy,
  NavigationMode,
  SlideVisualState,
} from '../../types/index'
import type { AxisStrategy } from '../direction/Direction'

export interface EffectLayout {
  positioning: 'track' | 'slides';
  height: 'content' | 'viewport';
}

export interface EffectContext {
  layout: LayoutModel;
  axis: AxisStrategy;
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
  readonly layout: EffectLayout;
  readonly supportsMultipleSlides: boolean;
  readonly navigationMode: 'page' | 'slide';
  readonly loopStrategy?: LoopStrategy;
  compute(ctx: EffectContext): SlideVisualState[];
}

export function loopOffset(
  index: number,
  progress: number,
  slideCount: number,
  infinite: boolean,
): number {
  let offset = index - progress
  if (!infinite || slideCount <= 1) return offset

  const half = slideCount / 2
  while (offset > half) offset -= slideCount
  while (offset < -half) offset += slideCount
  return offset
}
