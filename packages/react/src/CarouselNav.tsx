import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useCarouselOptional } from "./useCarousel.ts";

export interface CarouselNavButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

export function CarouselPrevious({ children, onClick, ...rest }: CarouselNavButtonProps) {
  const carousel = useCarouselOptional();
  return (
    <button
      type="button"
      aria-label="Previous slide"
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        carousel?.previous();
      }}
    >
      {children ?? "‹"}
    </button>
  );
}

export function CarouselNext({ children, onClick, ...rest }: CarouselNavButtonProps) {
  const carousel = useCarouselOptional();
  return (
    <button
      type="button"
      aria-label="Next slide"
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        carousel?.next();
      }}
    >
      {children ?? "›"}
    </button>
  );
}
