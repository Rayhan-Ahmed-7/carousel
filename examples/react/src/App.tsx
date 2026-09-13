import { useRef, useState, type RefObject } from "react";
import type { Carousel as CoreCarousel, EffectName } from "@carousel/core";
import {
  Carousel,
  CarouselSlide,
  useCarouselState,
} from "@carousel/react";

const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#a855f7"];
const IMAGES = [
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=85",
];
const EFFECTS: EffectName[] = [
  "slide",
  "fade",
  "card",
  "cube",
  "coverflow",
  "creative",
  "flip",
];
const EFFECT_OPTIONS: Record<string, Record<string, unknown>> = {
  slide: {},
  fade: {},
  card: {
    perSlideOffset: 14,
    perSlideRotate: 2,
    dragRotate: 15,
    dragScale: 0.5,
    dragTravelRatio: 0.45,
    handoffThreshold: 0.5,
    cardWidthRatio: 0.4,
    cardInsetRatio: 0.02,
    limitProgress: 4,
  },
  cube: {},
  coverflow: { rotate: 40, depth: 120, spacing: 0.55 },
  creative: {
    prev: { translate: [-120, 0, -200], rotate: [0, 0, -12], opacity: 0.4 },
    next: { translate: [120, 0, -200], rotate: [0, 0, 12], opacity: 0.4 },
  },
  flip: {},
};

export function App() {
  const [effect, setEffect] = useState<EffectName>("card");
  const carouselRef = useRef<CoreCarousel | null>(null);

  return (
    <main className="page">
      <h1>React Carousel</h1>
      <p className="hint">Drag, use arrow keys, or click the buttons.</p>

      <div className="effect-picker">
        <label htmlFor="effect">Effect:</label>
        <select
          id="effect"
          value={effect}
          onChange={(event) => setEffect(event.target.value as EffectName)}
        >
          {EFFECTS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <Carousel
        key={effect}
        className="carousel"
        viewportClassName="viewport"
        controls={{
          className: "custom-controls",
          previous: {
            className: "custom-nav",
            children: "←",
            style: { background: "#f59e0b", color: "#111827" },
          },
          next: {
            className: "custom-nav",
            children: "→",
            style: { background: "#f59e0b", color: "#111827" },
          },
          pagination: {
            className: "custom-pagination",
            dotStyle: { background: "#9ca3af" },
            activeDotStyle: { background: "#f59e0b", transform: "scale(1.5)" },
          },
        }}
        onReady={(carousel) => {
          carouselRef.current = carousel;
        }}
        options={{
          axis: "horizontal",
          slidesPerView: 1,
          gap: 20,
          breakpoints: {
            480: { slidesPerView: 2, gap: 20 },
            768: { slidesPerView: 3, gap: 30 },
            1024: { slidesPerView: 4, gap: 40 },
          },
          transitionDuration: 500,
          loop: "infinite",
          effect,
          effectOptions: EFFECT_OPTIONS[effect],
        }}
      >
        {COLORS.map((color, i) => (
          <CarouselSlide key={i} index={i}>
            <div
              className="slide"
              style={{
                backgroundColor: color,
                backgroundImage: `linear-gradient(180deg, transparent 35%, ${color} 100%), url(${IMAGES[i]})`,
              }}
            >
              {i + 1}
            </div>
          </CarouselSlide>
        ))}

        <Status effect={effect} />
      </Carousel>

      <ExternalControls carouselRef={carouselRef} />

      <section className="basic-example">
        <h2>Basic Carousel</h2>
        <p className="hint">
          The default slide effect with no custom effect options.
        </p>
        <Carousel
          // className="carousel"
          // viewportClassName="basic-viewport"
          options={{
            slidesPerView: 3,
            effect: "slide",
            loop: "infinite",
          }}
        >
          {COLORS.map((color, i) => (
            <CarouselSlide key={i} >
              <div className="basic-slide" style={{ backgroundColor: color }}>
                {i + 1}
              </div>
            </CarouselSlide>
          ))}
          <Status effect="slide" />
        </Carousel>
      </section>
    </main>
  );
}

function ExternalControls({
  carouselRef,
}: {
  carouselRef: RefObject<CoreCarousel | null>;
}) {
  return (
    <div className="external-controls">
      <p>Imperative API:</p>
      <button type="button" onClick={() => carouselRef.current?.previous()}>
        Previous
      </button>
      <button type="button" onClick={() => carouselRef.current?.next()}>
        Next
      </button>
      {[0, 2, 4].map((index) => (
        <button key={index} type="button" onClick={() => carouselRef.current?.goTo(index)}>
          Go to {index + 1}
        </button>
      ))}
    </div>
  );
}

function Status({ effect }: { effect: string }) {
  const state = useCarouselState();
  return (
    <p className="status">
      effect={effect} active={state.activeIndex} progress=
      {state.progress.toFixed(2)} dragging={String(state.isDragging)} animating=
      {String(state.isAnimating)}
    </p>
  );
}
