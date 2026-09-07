import type {
  Axis as AxisType,
  CarouselOptions,
  CarouselState,
  Direction,
  Measurements,
  RenderModel,
} from "../types/index.ts";
import { EventBus } from "../events/EventBus.ts";
import type { CarouselEvents } from "../events/Events.ts";
import { StateStore } from "../state/StateStore.ts";
import { StateMachine } from "../state/StateMachine.ts";
import { Scheduler } from "../scheduler/Scheduler.ts";
import { FiniteNavigation } from "../navigation/FiniteNavigation.ts";
import { InfiniteNavigation } from "../navigation/InfiniteNavigation.ts";
import { RewindNavigation } from "../navigation/RewindNavigation.ts";
import type { NavigationStrategy } from "../navigation/NavigationStrategy.ts";
import { LayoutEngine } from "../layout/LayoutEngine.ts";
import { ResponsiveConfig } from "../responsive/ResponsiveConfig.ts";
import { ResponsiveResolver } from "../responsive/ResponsiveResolver.ts";
import { HorizontalAxis } from "../visual/direction/HorizontalAxis.ts";
import { VerticalAxis } from "../visual/direction/VerticalAxis.ts";
import type { Axis } from "../visual/direction/Direction.ts";
import { EffectRegistry } from "../visual/effects/EffectRegistry.ts";
import { SlideEffect } from "../visual/effects/SlideEffect.ts";
import { FadeEffect } from "../visual/effects/FadeEffect.ts";
import { CardEffect } from "../visual/effects/CardEffect.ts";
import { CubeEffect } from "../visual/effects/CubeEffect.ts";
import { CoverflowEffect } from "../visual/effects/CoverflowEffect.ts";
import { CreativeEffect } from "../visual/effects/CreativeEffect.ts";
import { FlipEffect } from "../visual/effects/FlipEffect.ts";
import type { Effect } from "../visual/effects/Effect.ts";
import type { Modifier } from "../visual/modifiers/Modifier.ts";
import { VisualEngine } from "../visual/VisualEngine.ts";
import { AnimationEngine } from "../animation/AnimationEngine.ts";
import { resolveEasing } from "../animation/Easing.ts";
import { InteractionEngine } from "../interaction/InteractionEngine.ts";
import type { PointerSample } from "../interaction/DragController.ts";
import { PluginManager } from "../plugins/PluginManager.ts";
import type { Plugin } from "../plugins/Plugin.ts";

const DEFAULT_OPTIONS: Required<
  Pick<
    CarouselOptions,
    | "axis"
    | "slidesPerView"
    | "gap"
    | "loop"
    | "startIndex"
    | "effect"
    | "transitionDuration"
    | "drag"
    | "dragThreshold"
  >
> = {
  axis: "horizontal",
  slidesPerView: 1,
  gap: 0,
  loop: "finite",
  startIndex: 0,
  effect: "slide",
  transitionDuration: 400,
  drag: true,
  dragThreshold: 30,
};

export interface CarouselDeps {
  measurements: Measurements;
  viewportWidth: number;
}

export class Carousel {
  readonly events = new EventBus<CarouselEvents>();
  private readonly store: StateStore;
  private readonly machine = new StateMachine();
  private readonly scheduler = new Scheduler();
  private readonly layoutEngine = new LayoutEngine();
  private readonly visualEngine = new VisualEngine();
  private readonly effects = new EffectRegistry();
  private readonly animation: AnimationEngine;
  private readonly plugins: PluginManager;

  private options: CarouselOptions;
  private resolver: ResponsiveResolver;
  private navigation!: NavigationStrategy;
  private axis!: Axis;
  private axisName!: AxisType;
  private effect!: Effect;
  private modifiers: Modifier[] = [];
  private measurements: Measurements;
  private viewportWidth: number;
  private layoutCache!: ReturnType<LayoutEngine["compute"]>;
  private lastRender: RenderModel | null = null;
  private playing = false;
  private autoplayTimer: number | null = null;
  private autoplayDelay = 3000;
  private interaction: InteractionEngine | null = null;

  constructor(options: CarouselOptions, deps: CarouselDeps) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.measurements = deps.measurements;
    this.viewportWidth = deps.viewportWidth;
    this.animation = new AnimationEngine(this.scheduler);

    this.effects.register(new SlideEffect());
    this.effects.register(new FadeEffect());
    this.effects.register(new CardEffect());
    this.effects.register(new CubeEffect());
    this.effects.register(new CoverflowEffect());
    this.effects.register(new CreativeEffect());
    this.effects.register(new FlipEffect());

    this.resolver = new ResponsiveResolver(
      this.options,
      ResponsiveConfig.parse(this.options.breakpoints),
    );

    const breakpointWidth = deps.measurements.containerWidth || deps.viewportWidth;
    const resolved = this.resolver.resolve(breakpointWidth);
    this.applyResolved(resolved);

    const startIndex = Math.max(
      0,
      Math.min(this.options.startIndex ?? 0, deps.measurements.slideCount - 1),
    );

    this.store = new StateStore({
      activeIndex: startIndex,
      realIndex: startIndex,
      progress: startIndex,
      isDragging: false,
      isSettling: false,
      isAnimating: false,
      direction: "none",
      slideCount: deps.measurements.slideCount,
      navigationCount: deps.measurements.slideCount,
    });

    this.store.subscribe((s) => this.events.emit("stateChange", s));

    this.plugins = new PluginManager({
      on: (event, fn) => this.events.on(event as keyof CarouselEvents, fn as never),
      emit: (event, payload) =>
        this.events.emit(event as keyof CarouselEvents, payload as never),
      api: {
        next: () => this.next(),
        previous: () => this.previous(),
        goTo: (i: number) => this.goTo(i, true),
      },
    });

    this.computeLayout();
    this.machine.transition("idle");
    this.render();
    this.events.emit("init", undefined);
  }

  getOptions(): Readonly<CarouselOptions> {
    return this.options;
  }

  getState(): CarouselState {
    return this.store.getState();
  }

  subscribe(fn: (s: CarouselState) => void): () => void {
    return this.store.subscribe((s) => fn(s));
  }

  getRenderModel(): RenderModel | null {
    return this.lastRender;
  }

  getLayout() {
    return this.layoutCache;
  }

  next(): void {
    const s = this.store.getState();
    const target = this.navigation.next({
      activeIndex: s.activeIndex,
      slideCount: s.slideCount,
      slidesPerView: this.navigationSlidesPerView(),
    });
    this.goTo(target, true);
  }

  previous(): void {
    const s = this.store.getState();
    const target = this.navigation.previous({
      activeIndex: s.activeIndex,
      slideCount: s.slideCount,
      slidesPerView: this.navigationSlidesPerView(),
    });
    this.goTo(target, true);
  }

  goTo(index: number, animate = true): void {
    const s = this.store.getState();
    const target = this.navigation.goTo(
      {
        activeIndex: s.activeIndex,
        slideCount: s.slideCount,
        slidesPerView: this.navigationSlidesPerView(),
      },
      index,
    );
    if (target === s.activeIndex && s.progress === target) {
      if (s.isSettling) {
        this.store.setState({ isSettling: false });
        this.render();
      }
      return;
    }
    const infiniteSlide = this.options.loop === "infinite" && this.effect.name === "slide";
    const wrapsForward =
      infiniteSlide && s.activeIndex === s.slideCount - 1 && target === 0;
    const wrapsBackward =
      infiniteSlide && s.activeIndex === 0 && target === s.slideCount - 1;
    const animationTarget = wrapsForward
      ? s.slideCount
      : wrapsBackward
        ? -1
        : target;
    const direction: Direction = wrapsForward
      ? "next"
      : wrapsBackward
        ? "previous"
        : target > s.activeIndex
          ? "next"
          : target < s.activeIndex
            ? "previous"
            : s.direction;

    this.events.emit("transitionStart", { from: s.activeIndex, to: target });

    if (!animate || this.options.transitionDuration === 0) {
      this.store.setState({
        activeIndex: target,
        realIndex: target,
        progress: target,
        direction,
        isSettling: false,
        isAnimating: false,
      });
      this.render();
      this.events.emit("transitionEnd", { activeIndex: target });
      this.events.emit("slideChange", { activeIndex: target, direction });
      return;
    }

    this.machine.transition("animating");
    this.store.setState({ direction, isAnimating: true });
    const from = s.progress;
    this.animation.animate({
      from,
      to: animationTarget,
      duration: this.options.transitionDuration ?? 400,
      easing: resolveEasing(this.options.easing),
      onUpdate: (v) => {
        this.store.setState({ progress: v });
        this.render();
      },
      onComplete: () => {
        this.store.setState({
          activeIndex: target,
          realIndex: target,
          progress: target,
          isSettling: false,
          isAnimating: false,
        });
        this.machine.transition("idle");
        this.render();
        this.events.emit("transitionEnd", { activeIndex: target });
        this.events.emit("slideChange", { activeIndex: target, direction });
      },
    });
  }

  play(delay?: number): void {
    if (delay != null) this.autoplayDelay = delay;
    if (this.playing) return;
    this.playing = true;
    const loop = () => {
      if (!this.playing) return;
      this.autoplayTimer = setTimeout(() => {
        this.next();
        loop();
      }, this.autoplayDelay) as unknown as number;
    };
    loop();
  }

  pause(): void {
    this.playing = false;
    if (this.autoplayTimer != null) {
      clearTimeout(this.autoplayTimer as unknown as ReturnType<typeof setTimeout>);
      this.autoplayTimer = null;
    }
  }

  isPlaying(): boolean {
    return this.playing;
  }

  updateMeasurements(m: Measurements): void {
    const countChanged = m.slideCount !== this.measurements.slideCount;
    this.measurements = m;
    const resolved = this.resolver.resolve(m.containerWidth || this.viewportWidth);
    this.applyResolved(resolved);
    this.computeLayout();
    if (countChanged) {
      const s = this.store.getState();
      const clamped = Math.max(0, Math.min(s.activeIndex, m.slideCount - 1));
      this.store.setState({
        slideCount: m.slideCount,
        activeIndex: clamped,
        realIndex: clamped,
        progress: clamped,
        navigationCount: this.computeNavigationCountFor(m.slideCount),
      });
    }
    this.render();
    this.events.emit("resize", m);
  }

  updateViewportWidth(width: number): void {
    this.viewportWidth = width;
    const resolved = this.resolver.resolve(width);
    this.applyResolved(resolved);
    this.computeLayout();
    this.render();
  }

  // --- Interaction ---
  bindInteraction(): InteractionEngine {
    this.interaction = new InteractionEngine(
      {
        axis: this.axisName,
        stride: this.layoutCache.slideSize + this.layoutCache.gap,
        threshold: this.options.dragThreshold ?? 30,
        velocityThreshold: 0.5,
      },
      {
        onDragStart: () => {
          if (!this.options.drag) return;
          this.animation.cancel();
          this.machine.transition("dragging");
          this.store.setState({ isDragging: true, isSettling: false });
          this.events.emit("dragStart", undefined);
        },
        onDragMove: (deltaProgress) => {
          if (!this.options.drag) return;
          const s = this.store.getState();
          const progress = Math.max(
            0,
            Math.min(s.activeIndex + deltaProgress, s.slideCount - 1),
          );
          const direction: Direction = deltaProgress > 0
            ? "next"
            : deltaProgress < 0
              ? "previous"
              : s.direction;
          this.store.setState({ progress, direction });
          this.events.emit("dragMove", { progress });
          this.render();
        },
        onDragEnd: (decision) => {
          if (!this.options.drag) return;
          this.store.setState({ isDragging: false, isSettling: true });
          this.events.emit("dragEnd", undefined);
          this.machine.transition("settling");
          const s = this.store.getState();
          let target = s.activeIndex;
          if (decision === "next") target = s.activeIndex + 1;
          else if (decision === "previous") target = s.activeIndex - 1;
          this.goTo(target, true);
        },
      },
    );
    return this.interaction;
  }

  pointerDown(sample: PointerSample): void {
    this.interaction?.start(sample);
  }
  pointerMove(sample: PointerSample): void {
    this.interaction?.move(sample);
  }
  pointerUp(): void {
    this.interaction?.end();
  }

  registerEffect(effect: Effect): void {
    this.effects.register(effect);
  }

  useModifier(mod: Modifier): void {
    this.modifiers.push(mod);
    this.render();
  }

  installPlugin(plugin: Plugin): void {
    this.plugins.install(plugin);
  }

  uninstallPlugin(name: string): void {
    this.plugins.uninstall(name);
  }

  destroy(): void {
    this.animation.cancel();
    this.pause();
    this.plugins.uninstallAll();
    this.machine.transition("destroyed");
    this.events.emit("destroy", undefined);
    this.events.clear();
  }

  private applyResolved(resolved: CarouselOptions): void {
    this.options = { ...this.options, ...resolved };
    const effectName = this.options.effect ?? "slide";
    const effect = this.effects.get(effectName) ?? new SlideEffect();
    if (!effect.supportsMultipleSlides) {
      this.options.slidesPerView = 1;
    }
    this.axisName = this.options.axis ?? "horizontal";
    this.axis = this.axisName === "vertical" ? new VerticalAxis() : new HorizontalAxis();
    this.navigation = this.createNavigation();
    this.effect = effect;
    if (this.interaction) {
      this.interaction.update({
        axis: this.axisName,
        threshold: this.options.dragThreshold ?? 30,
        stride: this.layoutCache ? this.layoutCache.slideSize + this.layoutCache.gap : undefined,
      });
    }
  }

  private createNavigation(): NavigationStrategy {
    switch (this.options.loop) {
      case "infinite":
        return new InfiniteNavigation();
      case "rewind":
        return new RewindNavigation();
      default:
        return new FiniteNavigation();
    }
  }

  private navigationSlidesPerView(): number {
    return this.effect.navigationMode === "slide"
      ? 1
      : this.layoutCache.slidesPerView;
  }

  private computeLayout(): void {
    this.layoutCache = this.layoutEngine.compute({
      axis: this.axisName,
      containerWidth: this.measurements.containerWidth,
      containerHeight: this.measurements.containerHeight,
      slideCount: this.measurements.slideCount,
      slidesPerView: this.options.slidesPerView ?? 1,
      gap: this.options.gap ?? 0,
    });
    this.store.setState({ navigationCount: this.computeNavigationCount() });
    if (this.interaction) {
      this.interaction.update({
        stride: this.layoutCache.slideSize + this.layoutCache.gap,
      });
    }
  }

  private computeNavigationCount(): number {
    return this.computeNavigationCountFor(this.store.getState().slideCount);
  }

  private computeNavigationCountFor(slideCount: number): number {
    if (this.options.loop === "infinite") return slideCount;
    return Math.max(0, slideCount - this.navigationSlidesPerView() + 1);
  }

  private render(): void {
    const s = this.store.getState();
    const model = this.visualEngine.compute({
      layout: this.layoutCache,
      axis: this.axis,
      effect: this.effect,
      modifiers: this.modifiers,
      slideCount: s.slideCount,
      activeIndex: s.activeIndex,
      progress: s.progress,
      isDragging: s.isDragging,
      isSettling: s.isSettling,
      dragOffsetPx:
        (s.progress - s.activeIndex) * (this.layoutCache.slideSize + this.layoutCache.gap),
      dragDirection: s.direction,
      effectOptions: this.options.effectOptions ?? {},
      loop: this.options.loop ?? "finite",
    });
    this.lastRender = model;
    this.events.emit("render", model);
  }
}
