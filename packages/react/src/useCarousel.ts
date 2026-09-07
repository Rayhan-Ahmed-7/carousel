import { useContext } from "react";
import { CarouselRuntimeContext } from "./context.ts";
import type { Carousel } from "@carousel/core";

export function useCarousel(): Carousel {
  const carousel = useContext(CarouselRuntimeContext);
  if (!carousel) {
    throw new Error("useCarousel must be used within <Carousel> (after mount)");
  }
  return carousel;
}

export function useCarouselOptional(): Carousel | null {
  return useContext(CarouselRuntimeContext);
}
