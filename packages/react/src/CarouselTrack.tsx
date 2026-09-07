import type { CSSProperties, ReactNode } from "react";
import { useCarouselSetup } from "./useCarouselSetup.ts";

export interface CarouselTrackProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function CarouselTrack({ className, style, children }: CarouselTrackProps) {
  const { trackRef } = useCarouselSetup();
  return (
    <div
      ref={trackRef as unknown as React.Ref<HTMLDivElement>}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", ...style }}
    >
      {children}
    </div>
  );
}
