import { createCarousel } from "@carousel/dom";
import type { CarouselOptions, EffectName } from "@carousel/core";

const root = document.getElementById("carousel") as HTMLElement;
const viewport = document.getElementById("viewport") as HTMLElement;
const track = document.getElementById("track") as HTMLElement;
const slides = Array.from(
  track.querySelectorAll<HTMLElement>(".carousel__slide"),
);
const effectSelect = document.getElementById("effect") as HTMLSelectElement;

const EFFECT_OPTIONS: Record<string, Record<string, unknown>> = {
  slide: {},
  fade: {},
  card: { depth: 40, scale: 0.06 },
  cube: {},
  coverflow: { rotate: 40, depth: 120, spacing: 0.55 },
  creative: {
    prev: { translate: [-120, 0, -200], rotate: [0, 0, -12], opacity: 0.4 },
    next: { translate: [120, 0, -200], rotate: [0, 0, 12], opacity: 0.4 },
  },
};

let instance = mount(effectSelect.value as EffectName);

effectSelect.addEventListener("change", () => {
  instance.destroy();
  for (const el of slides) {
    el.style.transform = "";
    el.style.opacity = "";
    el.style.zIndex = "";
    el.style.visibility = "";
  }
  instance = mount(effectSelect.value as EffectName);
});

function mount(effect: EffectName) {
  const options: CarouselOptions = {
    axis: "horizontal",
    slidesPerView: 1,
    gap: 0,
    transitionDuration: 500,
    startIndex: 0,
    loop: effect === "cube" ? "infinite" : "finite",
    effect,
    effectOptions: EFFECT_OPTIONS[effect] ?? {},
    drag: true,
  };
  const { carousel, destroy } = createCarousel(
    { root, viewport, track, slides },
    options,
  );

  const prev = document.getElementById("prev")!;
  const next = document.getElementById("next")!;
  const pagination = document.getElementById("pagination")!;
  const status = document.getElementById("status")!;

  const onPrev = () => carousel.previous();
  const onNext = () => carousel.next();
  prev.addEventListener("click", onPrev);
  next.addEventListener("click", onNext);

  function renderPagination(activeIndex: number, count: number) {
    pagination.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", `Go to slide ${i + 1}`);
      if (i === activeIndex) btn.setAttribute("aria-selected", "true");
      btn.addEventListener("click", () => carousel.goTo(i, true));
      pagination.appendChild(btn);
    }
  }

  renderPagination(carousel.getState().activeIndex, carousel.getState().slideCount);

  const unsub = carousel.subscribe((state) => {
    renderPagination(state.activeIndex, state.slideCount);
    status.textContent = `effect=${effect}  active=${state.activeIndex}  progress=${state.progress.toFixed(2)}  dragging=${state.isDragging}  animating=${state.isAnimating}`;
  });

  return {
    destroy() {
      unsub();
      prev.removeEventListener("click", onPrev);
      next.removeEventListener("click", onNext);
      destroy();
    },
  };
}
