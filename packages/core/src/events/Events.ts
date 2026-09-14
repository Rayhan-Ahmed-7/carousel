import type { CarouselState, Direction, Measurements, RenderModel } from '../types/index'

export interface CarouselEvents {
  init: void;
  destroy: void;
  slideChange: { activeIndex: number; direction: Direction };
  stateChange: CarouselState;
  transitionStart: { from: number; to: number };
  transitionEnd: { activeIndex: number };
  dragStart: void;
  dragMove: { progress: number };
  dragEnd: void;
  resize: Measurements;
  render: RenderModel;
}
