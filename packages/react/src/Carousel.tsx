import {
  Children,
  cloneElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { Carousel as CoreCarousel, type CarouselOptions } from "@carousel/core";
import {
  DOMMeasurements,
  DOMRenderer,
  FocusManager,
  KeyboardAdapter,
  PointerEventAdapter,
  ResizeObserverAdapter,
  applyCarouselDOMDefaults,
} from "@carousel/dom";
import {
  CarouselRuntimeContext,
  CarouselSetupContext,
  type CarouselSetupContextValue,
} from "./context.ts";
import {
  isCarouselSlideElement,
  type CarouselSlideProps,
} from "./CarouselSlide.tsx";
import {
  CarouselNext,
  CarouselPrevious,
  type CarouselNavButtonProps,
} from "./CarouselNav.tsx";
import {
  CarouselPagination,
  type CarouselPaginationProps,
} from "./CarouselPagination.tsx";

export interface CarouselControlsOptions {
  className?: string;
  style?: CSSProperties;
  previous?: false | CarouselNavButtonProps;
  next?: false | CarouselNavButtonProps;
  pagination?: false | CarouselPaginationProps;
}

export interface CarouselProps {
  options?: CarouselOptions;
  drag?: boolean;
  keyboard?: boolean;
  perspective?: number | false;
  touchAction?: string;
  className?: string;
  style?: CSSProperties;
  viewportClassName?: string;
  viewportStyle?: CSSProperties;
  trackClassName?: string;
  trackStyle?: CSSProperties;
  controls?: boolean | CarouselControlsOptions;
  children?: ReactNode;
  onReady?: (carousel: CoreCarousel) => void;
}

export function Carousel(props: CarouselProps) {
  const {
    options,
    drag = true,
    keyboard = true,
    perspective = 1200,
    touchAction,
    className,
    style,
    viewportClassName,
    viewportStyle,
    trackClassName,
    trackStyle,
    controls = true,
    children,
    onReady,
  } = props;

  const rootEl = useRef<HTMLElement | null>(null);
  const viewportEl = useRef<HTMLElement | null>(null);
  const trackEl = useRef<HTMLElement | null>(null);
  const slideEls = useRef<Map<number, HTMLElement>>(new Map());
  const [carousel, setCarousel] = useState<CoreCarousel | null>(null);

  const childCount = Children.count(children);
  const childElements = Children.toArray(children);
  const slides = childElements
    .filter(isCarouselSlideElement)
    .map((child, childIndex) => {
      const slide = child as ReactElement<CarouselSlideProps>;
      return {
        element: slide,
        index: slide.props.index ?? childIndex,
      };
    });
  const auxiliaryChildren = childElements.filter(
    (child) => !isCarouselSlideElement(child),
  );
  const controlsOptions = controls === true ? {} : controls;
  const defaultControls = controlsOptions ? (
    <div
      className={controlsOptions.className ?? "carousel-controls"}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        pointerEvents: "none",
        ...controlsOptions.style,
      }}
    >
      {controlsOptions.previous !== false && (
        <CarouselPrevious
          aria-label="Previous slide"
          {...controlsOptions.previous}
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            width: 40,
            height: 40,
            transform: "translateY(-50%)",
            display: "grid",
            placeItems: "center",
            padding: 0,
            border: "1px solid rgba(255, 255, 255, 0.28)",
            borderRadius: "50%",
            background: "rgba(17, 24, 39, 0.78)",
            color: "white",
            fontSize: 24,
            lineHeight: 1,
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.24)",
            cursor: "pointer",
            pointerEvents: "auto",
            ...controlsOptions.previous?.style,
          }}
        />
      )}
      {controlsOptions.next !== false && (
        <CarouselNext
          aria-label="Next slide"
          {...controlsOptions.next}
          style={{
            position: "absolute",
            right: 16,
            top: "50%",
            width: 40,
            height: 40,
            transform: "translateY(-50%)",
            display: "grid",
            placeItems: "center",
            padding: 0,
            border: "1px solid rgba(255, 255, 255, 0.28)",
            borderRadius: "50%",
            background: "rgba(17, 24, 39, 0.78)",
            color: "white",
            fontSize: 24,
            lineHeight: 1,
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.24)",
            cursor: "pointer",
            pointerEvents: "auto",
            ...controlsOptions.next?.style,
          }}
        />
      )}
      {controlsOptions.pagination !== false && (
        <CarouselPagination
          {...controlsOptions.pagination}
          style={{
            position: "absolute",
            left: "50%",
            bottom: 16,
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 10px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: 999,
            background: "rgba(17, 24, 39, 0.72)",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.24)",
            pointerEvents: "auto",
            ...controlsOptions.pagination?.style,
          }}
          dotStyle={{
            width: 8,
            height: 8,
            padding: 0,
            border: 0,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.5)",
            cursor: "pointer",
            ...controlsOptions.pagination?.dotStyle,
          }}
          activeDotStyle={{
            width: 8,
            height: 8,
            padding: 0,
            border: 0,
            borderRadius: "50%",
            background: "white",
            cursor: "pointer",
            ...controlsOptions.pagination?.activeDotStyle,
          }}
        />
      )}
    </div>
  ) : null;

  const registerSlide = useCallback((el: HTMLElement | null, index: number) => {
    if (el) slideEls.current.set(index, el);
    else slideEls.current.delete(index);
  }, []);

  const rootRef = useCallback((el: HTMLElement | null) => {
    rootEl.current = el;
  }, []);
  const viewportRef = useCallback((el: HTMLElement | null) => {
    viewportEl.current = el;
  }, []);
  const trackRef = useCallback((el: HTMLElement | null) => {
    trackEl.current = el;
  }, []);

  const setup: CarouselSetupContextValue = useMemo(
    () => ({ registerSlide, viewportRef, trackRef }),
    [registerSlide, viewportRef, trackRef],
  );

  useLayoutEffect(() => {
    if (!viewportEl.current) return;
    const measurer = new DOMMeasurements();
    const orderedSlides = () => {
      const arr: HTMLElement[] = [];
      const keys = Array.from(slideEls.current.keys()).sort((a, b) => a - b);
      for (const k of keys) {
        const el = slideEls.current.get(k);
        if (el) arr.push(el);
      }
      return arr;
    };

    const measurements = measurer.measure({
      viewport: viewportEl.current,
      slides: orderedSlides(),
    });

    const core = new CoreCarousel(
      { drag, ...options },
      { measurements, viewportWidth: window.innerWidth },
    );

    const renderer = new DOMRenderer({ useWillChange: true });
    const pointer = new PointerEventAdapter();
    const keys = new KeyboardAdapter();
    const focus = new FocusManager();
    const resize = new ResizeObserverAdapter();

    applyCarouselDOMDefaults(
      {
        viewport: viewportEl.current,
        track: trackEl.current!,
        slides: orderedSlides(),
      },
      options?.axis ?? "horizontal",
      perspective,
      drag,
      touchAction,
    );

    if (rootEl.current) focus.attach(rootEl.current);

    const unsubRender = core.events.on("render", (model) => {
      renderer.render(orderedSlides(), model);
    });

    if (drag) {
      core.bindInteraction();
      pointer.attach(viewportEl.current, {
        onDown: (s) => core.pointerDown(s),
        onMove: (s) => core.pointerMove(s),
        onUp: () => core.pointerUp(),
      });
    }

    if (keyboard && rootEl.current) {
      keys.attach(rootEl.current, {
        onNext: () => core.next(),
        onPrevious: () => core.previous(),
        onFirst: () => core.goTo(0, true),
        onLast: () => core.goTo(Math.max(0, core.getState().slideCount - 1), true),
      });
    }

    resize.observe(viewportEl.current, () => {
      if (!viewportEl.current) return;
      const m = measurer.measure({
        viewport: viewportEl.current,
        slides: orderedSlides(),
      });
      core.updateViewportWidth(window.innerWidth);
      core.updateMeasurements(m);
    });

    const initial = core.getRenderModel();
    if (initial) renderer.render(orderedSlides(), initial);

    setCarousel(core);
    onReady?.(core);

    return () => {
      unsubRender();
      renderer.destroy();
      pointer.detach();
      keys.detach();
      focus.detach();
      resize.disconnect();
      core.destroy();
      setCarousel(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!carousel || !viewportEl.current) return;
    const rect = viewportEl.current.getBoundingClientRect();
    carousel.updateMeasurements({
      containerWidth: rect.width,
      containerHeight: rect.height,
      slideCount: slideEls.current.size,
    });
  }, [carousel, childCount]);

  return (
    <section
      ref={rootRef as unknown as React.Ref<HTMLElement>}
      className={className}
      style={{ width: "100%", ...style }}
      tabIndex={0}
    >
      <CarouselSetupContext.Provider value={setup}>
        <CarouselRuntimeContext.Provider value={carousel}>
          <div
            ref={viewportRef as unknown as React.Ref<HTMLDivElement>}
            className={viewportClassName}
            style={{
              width: "100%",
              height: 300,
              overflow: "hidden",
              position: "relative",
              borderRadius: 12,
              background: "#f3f4f6",
              cursor: drag ? "grab" : "default",
              ...viewportStyle,
            }}
          >
            <div
              ref={trackRef as unknown as React.Ref<HTMLDivElement>}
              className={trackClassName}
              style={{ position: "relative", width: "100%", height: "100%", ...trackStyle }}
            >
              {slides.map(({ element, index }) =>
                cloneElement(element, { index }),
              )}
            </div>
            {defaultControls}
          </div>
          {auxiliaryChildren}
        </CarouselRuntimeContext.Provider>
      </CarouselSetupContext.Provider>
    </section>
  );
}
