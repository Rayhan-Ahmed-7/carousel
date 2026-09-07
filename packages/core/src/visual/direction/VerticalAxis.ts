import type { LayoutModel, SlideVisualState } from "../../types/index.ts";
import type { Axis } from "./Direction.ts";

export class VerticalAxis implements Axis {
  apply(state: SlideVisualState, mainAxisOffset: number): void {
    state.translateY = mainAxisOffset;
  }
  offsetFromLayout(layout: LayoutModel, index: number): number {
    return layout.positions[index] ?? 0;
  }
}
