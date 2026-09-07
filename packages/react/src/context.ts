import { createContext } from "react";
import type { Carousel } from "@carousel/core";

export interface CarouselSetupContextValue {
  registerSlide: (el: HTMLElement | null, index: number) => void;
  viewportRef: (el: HTMLElement | null) => void;
  trackRef: (el: HTMLElement | null) => void;
}

export const CarouselSetupContext = createContext<CarouselSetupContextValue | null>(null);

export const CarouselRuntimeContext = createContext<Carousel | null>(null);
