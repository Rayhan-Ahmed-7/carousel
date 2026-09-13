import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useCarouselSetup } from "./useCarouselSetup.ts";

export interface CarouselSlideProps {
  index?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export const isCarouselSlideElement = (value: ReactNode): boolean =>
  typeof value === "object" &&
  value !== null &&
  "type" in value &&
  value.type === CarouselSlide;

export function CarouselSlide({ index, className, style, children }: CarouselSlideProps) {
  const { registerSlide } = useCarouselSetup();
  const ref = useRef<HTMLDivElement | null>(null);
  const resolvedIndex = index ?? 0;

  useLayoutEffect(() => {
    registerSlide(ref.current, resolvedIndex);
    return () => registerSlide(null, resolvedIndex);
  }, [resolvedIndex, registerSlide]);

  return (
    <div
      ref={ref}
      className={className}
      data-carousel-slide-index={resolvedIndex}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
        borderRadius: 8,
        background: "#d1d5db",
        color: "#111827",
        userSelect: "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
