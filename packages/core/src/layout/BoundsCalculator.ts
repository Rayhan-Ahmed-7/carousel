import type { LayoutModel } from '../types/index'

export class BoundsCalculator {
  clamp(layout: LayoutModel, offset: number): number {
    return Math.max(layout.bounds.min, Math.min(offset, layout.bounds.max))
  }
  overshoot(layout: LayoutModel, offset: number): number {
    if (offset < layout.bounds.min) return offset - layout.bounds.min
    if (offset > layout.bounds.max) return offset - layout.bounds.max
    return 0
  }
}
