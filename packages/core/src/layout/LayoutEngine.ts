import type { Axis, LayoutModel } from '../types/index'

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
    const isH = input.axis === 'horizontal'
    const containerWidth = finiteNonNegative(input.containerWidth)
    const containerHeight = finiteNonNegative(input.containerHeight)
    const containerSize = isH ? containerWidth : containerHeight
    const crossSize = isH ? containerHeight : containerWidth
    const slideCount = Math.max(0, Math.floor(finiteNonNegative(input.slideCount)))
    const spv = Math.max(1, finiteNonNegative(input.slidesPerView))
    const gap = finiteNonNegative(input.gap)
    const totalGap = gap * (spv - 1)
    const slideSize = Math.max(0, (containerSize - totalGap) / spv)

    const positions: number[] = []
    for (let i = 0; i < slideCount; i++) {
      positions.push(i * (slideSize + gap))
    }

    const trackSize =
      slideCount > 0
        ? slideCount * slideSize + Math.max(0, slideCount - 1) * gap
        : 0

    const snapPoints = positions.slice()
    const max = Math.max(0, trackSize - containerSize)

    return {
      containerSize,
      crossSize,
      slideSize,
      gap,
      trackSize,
      slidesPerView: spv,
      positions,
      snapPoints,
      bounds: { min: 0, max },
    }
  }
}

function finiteNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0
}
