import type { BreakpointsMap, CarouselOptions } from "../types/index.ts";
import type { Breakpoint } from "./Breakpoint.ts";

export class ResponsiveConfig {
  static parse(map?: BreakpointsMap): Breakpoint[] {
    if (!map) return [];
    return Object.keys(map)
      .map((k) => Number(k))
      .filter((k) => !Number.isNaN(k))
      .sort((a, b) => a - b)
      .map((minWidth) => ({ minWidth, options: map[minWidth]! }));
  }
}
