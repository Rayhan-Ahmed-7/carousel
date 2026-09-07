import type { LayoutModel } from "../types/index.ts";

export class SnapCalculator {
  nearest(layout: LayoutModel, offset: number): number {
    if (layout.snapPoints.length === 0) return 0;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < layout.snapPoints.length; i++) {
      const d = Math.abs(layout.snapPoints[i]! - offset);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  }
}
