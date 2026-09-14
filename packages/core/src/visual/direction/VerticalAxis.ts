import type { LayoutModel, SlideVisualState } from '../../types/index'
import type { AxisStrategy } from './Direction'

export class VerticalAxis implements AxisStrategy {
  apply(state: SlideVisualState, mainAxisOffset: number): void {
    state.translateY = mainAxisOffset
  }
  offsetFromLayout(layout: LayoutModel, index: number): number {
    return layout.positions[index] ?? 0
  }
}
