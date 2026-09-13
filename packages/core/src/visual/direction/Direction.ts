import type { LayoutModel, SlideVisualState } from "../../types/index.ts";

export interface AxisStrategy {
  apply(state: SlideVisualState, mainAxisOffset: number): void;
  offsetFromLayout(layout: LayoutModel, index: number): number;
}
