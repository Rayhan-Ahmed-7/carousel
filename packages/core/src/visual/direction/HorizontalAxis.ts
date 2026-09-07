import type { LayoutModel, SlideVisualState } from "../../types/index.ts";
import type { Axis } from "./Direction.ts";

export class HorizontalAxis implements Axis {
  apply(state: SlideVisualState, mainAxisOffset: number): void {
    state.translateX = mainAxisOffset;
  }
  offsetFromLayout(layout: LayoutModel, index: number): number {
    return layout.positions[index] ?? 0;
  }
}
