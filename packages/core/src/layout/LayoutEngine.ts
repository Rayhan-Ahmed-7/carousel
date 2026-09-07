import type { Axis, LayoutModel } from "../types/index.ts";

export interface LayoutInput {
  axis: Axis;
  containerWidth: number;
  containerHeight: number;
  slideCount: number;
  slidesPerView: number;
  gap: number;
}

export class LayoutEngine {
  compute(input: LayoutInput): LayoutModel {
    const isH = input.axis === "horizontal";
    const containerSize = isH ? input.containerWidth : input.containerHeight;
    const crossSize = isH ? input.containerHeight : input.containerWidth;
    const spv = Math.max(1, input.slidesPerView);
    const totalGap = input.gap * (spv - 1);
    const slideSize = spv > 0 ? (containerSize - totalGap) / spv : containerSize;

    const positions: number[] = [];
    for (let i = 0; i < input.slideCount; i++) {
      positions.push(i * (slideSize + input.gap));
    }

    const trackSize =
      input.slideCount > 0
        ? input.slideCount * slideSize + Math.max(0, input.slideCount - 1) * input.gap
        : 0;

    const snapPoints = positions.slice();
    const max = Math.max(0, trackSize - containerSize);

    return {
      containerSize,
      crossSize,
      slideSize,
      gap: input.gap,
      trackSize,
      slidesPerView: spv,
      positions,
      snapPoints,
      bounds: { min: 0, max },
    };
  }
}
