export type Axis = "horizontal" | "vertical";

export type Direction = "next" | "previous" | "none";

export type NavigationMode = "finite" | "infinite" | "rewind";

export type LoopStrategy = "none" | "circular" | "physicalCopies";

export type EffectName =
  | "slide"
  | "fade"
  | "card"
  | "cube"
  | "coverflow"
  | "creative"
  | "flip"
  | (string & {});

/** Common viewport widths are suggested while custom numeric widths remain valid. */
export type BreakpointKey =
  | 320
  | 375
  | 480
  | 640
  | 768
  | 900
  | 1024
  | 1280
  | 1440
  | (number & {})
  | `${number}`;

export type BreakpointsMap = {
  [K in BreakpointKey]?: Partial<CarouselOptions>;
};

export interface CarouselOptions {
  axis?: Axis;
  slidesPerView?: number;
  gap?: number;
  loop?: NavigationMode;
  startIndex?: number;
  effect?: EffectName;
  effectOptions?: Record<string, unknown>;
  transitionDuration?: number;
  easing?: EasingFn | EasingName;
  drag?: boolean;
  dragThreshold?: number;
  breakpoints?: BreakpointsMap;
}

export type EasingName = "linear" | "easeOutCubic" | "easeInOutCubic";
export type EasingFn = (t: number) => number;

export interface SlideVisualState {
  index: number;
  /** Physical loop group for this render slot; zero is the logical slide group. */
  loopCopy?: number;
  width?: number;
  height?: number;
  translateX: number;
  translateY: number;
  translateZ: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
  opacity: number;
  zIndex: number;
  visible: boolean;
  position?: "absolute" | "relative";
  transformOrigin?: string;
  /** Full CSS transform string. If present, overrides the default builder. */
  transform?: string;
}

export interface RenderModel {
  slides: SlideVisualState[];
  logicalSlideCount: number;
  loopCopies: number;
  trackTranslate: { x: number; y: number };
}

export interface CarouselState {
  activeIndex: number;
  realIndex: number;
  /** Continuous visual position; infinite slide mode may use values outside the index range. */
  progress: number;
  isDragging: boolean;
  isSettling: boolean;
  isAnimating: boolean;
  direction: Direction;
  slideCount: number;
  navigationCount: number;
}

export type CarouselStatus =
  | "initializing"
  | "idle"
  | "dragging"
  | "settling"
  | "animating"
  | "destroyed";

export interface LayoutModel {
  containerSize: number;
  crossSize: number;
  slideSize: number;
  gap: number;
  trackSize: number;
  slidesPerView: number;
  positions: number[];
  snapPoints: number[];
  bounds: { min: number; max: number };
}

export interface Measurements {
  containerWidth: number;
  containerHeight: number;
  slideCount: number;
}
