import type { RenderModel, SlideVisualState } from "@carousel/core";
import type { Axis } from "@carousel/core";

export interface CarouselDOMElements {
  viewport: HTMLElement;
  track: HTMLElement;
  slides: HTMLElement[];
}

function setIfUnset(element: HTMLElement, property: string, value: string): void {
  const style = element.style as unknown as Record<string, string>;
  if (!style[property]) style[property] = value;
}

export function applyCarouselDOMDefaults(
  elements: CarouselDOMElements,
  axis: Axis,
  perspective: number | false,
  drag = true,
  touchAction?: string,
): void {
  setIfUnset(elements.viewport, "overflow", "hidden");
  setIfUnset(elements.viewport, "position", "relative");
  if (drag) {
    setIfUnset(
      elements.viewport,
      "touchAction",
      touchAction ?? (axis === "horizontal" ? "pan-y pinch-zoom" : "pan-x pinch-zoom"),
    );
    setIfUnset(elements.viewport, "userSelect", "none");
  }

  setIfUnset(elements.track, "position", "relative");
  setIfUnset(elements.track, "width", "100%");
  setIfUnset(elements.track, "height", "100%");
  setIfUnset(elements.track, "transformStyle", "preserve-3d");

  if (perspective !== false) {
    setIfUnset(elements.viewport, "perspective", `${perspective}px`);
  }

  for (const slide of elements.slides) {
    setIfUnset(slide, "position", "absolute");
    setIfUnset(slide, "top", "0");
    setIfUnset(slide, "left", "0");
    setIfUnset(slide, "backfaceVisibility", "hidden");
  }
}

export interface DOMRendererOptions {
  useWillChange?: boolean;
}

export class DOMRenderer {
  private opts: DOMRendererOptions;

  constructor(opts: DOMRendererOptions = {}) {
    this.opts = opts;
  }

  render(slides: HTMLElement[], model: RenderModel): void {
    const count = Math.min(slides.length, model.slides.length);
    for (let i = 0; i < count; i++) {
      const el = slides[i]!;
      const s = model.slides[i]!;
      this.applySlide(el, s);
    }
  }

  private applySlide(el: HTMLElement, s: SlideVisualState): void {
    const transform =
      s.transform ??
      `translate3d(${s.translateX}px, ${s.translateY}px, ${s.translateZ}px)` +
      (s.rotateX ? ` rotateX(${s.rotateX}deg)` : "") +
      (s.rotateY ? ` rotateY(${s.rotateY}deg)` : "") +
      (s.rotateZ ? ` rotateZ(${s.rotateZ}deg)` : "") +
      (s.scale !== 1 ? ` scale(${s.scale})` : "");

    el.style.transform = transform;
    if (s.position != null) el.style.position = s.position;
    if (s.position === "absolute") {
      el.style.left = "0";
      el.style.top = "0";
    }
    if (s.width != null) el.style.width = `${s.width}px`;
    if (s.height != null) el.style.height = `${s.height}px`;
    el.style.opacity = String(s.opacity);
    el.style.zIndex = String(s.zIndex);
    el.style.visibility = s.visible ? "visible" : "hidden";
    if (s.transformOrigin != null) el.style.transformOrigin = s.transformOrigin;
    if (this.opts.useWillChange) el.style.willChange = "transform, opacity";
  }
}
