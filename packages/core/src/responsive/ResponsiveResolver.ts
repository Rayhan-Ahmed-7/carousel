import type { CarouselOptions } from '../types/index'
import type { Breakpoint } from './Breakpoint'

export class ResponsiveResolver {
  private breakpoints: Breakpoint[]
  private base: CarouselOptions

  constructor(base: CarouselOptions, breakpoints: Breakpoint[]) {
    this.base = base
    this.breakpoints = breakpoints
  }

  resolve(viewportWidth: number): CarouselOptions {
    let merged: CarouselOptions = { ...this.base }
    for (const bp of this.breakpoints) {
      if (viewportWidth >= bp.minWidth) {
        merged = { ...merged, ...bp.options }
      }
    }
    return merged
  }
}
