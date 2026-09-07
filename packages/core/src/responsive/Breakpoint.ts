import type { CarouselOptions } from "../types/index.ts";

export interface Breakpoint {
  minWidth: number;
  options: Partial<CarouselOptions>;
}
