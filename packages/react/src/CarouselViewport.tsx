import type { CSSProperties, ReactNode } from "react";
import { useCarouselSetup } from "./useCarouselSetup.ts";

export interface CarouselViewportProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function CarouselViewport({ className, style, children }: CarouselViewportProps) {
  const { viewportRef } = useCarouselSetup();
  return (
    <div
      ref={viewportRef as unknown as React.Ref<HTMLDivElement>}
      className={className}
      style={{ overflow: "hidden", position: "relative", ...style }}
    >
      {children}
    </div>
  );
}
