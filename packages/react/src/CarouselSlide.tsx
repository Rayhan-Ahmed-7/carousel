import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useCarouselSetup } from "./useCarouselSetup.ts";

export interface CarouselSlideProps {
  index: number;
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

  useLayoutEffect(() => {
    registerSlide(ref.current, index);
    return () => registerSlide(null, index);
  }, [index, registerSlide]);

  return (
    <div
      ref={ref}
      className={className}
      data-carousel-slide-index={index}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
