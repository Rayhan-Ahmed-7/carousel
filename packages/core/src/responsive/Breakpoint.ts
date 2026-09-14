import type { CarouselOptions } from '../types/index'

export interface Breakpoint {
  minWidth: number;
  options: Partial<CarouselOptions>;
}
