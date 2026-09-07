import { useContext, useSyncExternalStore } from "react";
import { CarouselRuntimeContext } from "./context.ts";
import type { CarouselState } from "@carousel/core";

const EMPTY_STATE: CarouselState = {
  activeIndex: 0,
  realIndex: 0,
  progress: 0,
  isDragging: false,
  isSettling: false,
  isAnimating: false,
  direction: "none",
  slideCount: 0,
  navigationCount: 0,
};

export function useCarouselState(): CarouselState {
  const carousel = useContext(CarouselRuntimeContext);
  return useSyncExternalStore(
    (cb) => {
      if (!carousel) return () => {};
      return carousel.subscribe(() => cb());
    },
    () => (carousel ? carousel.getState() : EMPTY_STATE),
    () => EMPTY_STATE,
  );
}
