import type { Measurements } from "@carousel/core";

export interface DOMMeasurementInput {
  viewport: HTMLElement;
  slides: HTMLElement[] | HTMLCollection | NodeListOf<Element>;
}

export class DOMMeasurements {
  measure(input: DOMMeasurementInput): Measurements {
    const rect = input.viewport.getBoundingClientRect();
    const count =
      "length" in input.slides ? (input.slides as ArrayLike<unknown>).length : 0;
    return {
      containerWidth: rect.width,
      containerHeight: rect.height,
      slideCount: count,
    };
  }
}
