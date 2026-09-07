export * from "./types/index.ts";

export { Carousel } from "./api/Carousel.ts";
export type { CarouselDeps } from "./api/Carousel.ts";

export { EventBus } from "./events/EventBus.ts";
export type { CarouselEvents } from "./events/Events.ts";

export { StateStore } from "./state/StateStore.ts";
export { StateMachine } from "./state/StateMachine.ts";

export { Scheduler } from "./scheduler/Scheduler.ts";
export type { SchedulerAPI, FrameCallback } from "./scheduler/Scheduler.ts";

export { FiniteNavigation } from "./navigation/FiniteNavigation.ts";
export { InfiniteNavigation } from "./navigation/InfiniteNavigation.ts";
export { RewindNavigation } from "./navigation/RewindNavigation.ts";
export type { NavigationStrategy, NavigationContext } from "./navigation/NavigationStrategy.ts";

export { LayoutEngine } from "./layout/LayoutEngine.ts";
export { SnapCalculator } from "./layout/SnapCalculator.ts";
export { BoundsCalculator } from "./layout/BoundsCalculator.ts";

export { ResponsiveConfig } from "./responsive/ResponsiveConfig.ts";
export { ResponsiveResolver } from "./responsive/ResponsiveResolver.ts";
export type { Breakpoint } from "./responsive/Breakpoint.ts";

export type { Command, CommandContext } from "./commands/Command.ts";
export { NextCommand } from "./commands/next.ts";
export { PreviousCommand } from "./commands/previous.ts";
export { GoToCommand } from "./commands/goTo.ts";
export { PlayCommand } from "./commands/play.ts";
export { PauseCommand } from "./commands/pause.ts";

export { VisualEngine } from "./visual/VisualEngine.ts";
export type { Axis as VisualAxis } from "./visual/direction/Direction.ts";
export { HorizontalAxis } from "./visual/direction/HorizontalAxis.ts";
export { VerticalAxis } from "./visual/direction/VerticalAxis.ts";
export type { Effect, EffectContext } from "./visual/effects/Effect.ts";
export { EffectRegistry } from "./visual/effects/EffectRegistry.ts";
export { SlideEffect } from "./visual/effects/SlideEffect.ts";
export { FadeEffect } from "./visual/effects/FadeEffect.ts";
export { CardEffect } from "./visual/effects/CardEffect.ts";
export { CubeEffect } from "./visual/effects/CubeEffect.ts";
export { CoverflowEffect } from "./visual/effects/CoverflowEffect.ts";
export { CreativeEffect } from "./visual/effects/CreativeEffect.ts";
export type { CreativeSideOptions } from "./visual/effects/CreativeEffect.ts";
export { FlipEffect } from "./visual/effects/FlipEffect.ts";
export type { Modifier } from "./visual/modifiers/Modifier.ts";

export { AnimationEngine } from "./animation/AnimationEngine.ts";
export { Easing, resolveEasing } from "./animation/Easing.ts";

export { InteractionEngine } from "./interaction/InteractionEngine.ts";
export { DragController } from "./interaction/DragController.ts";
export type { PointerSample } from "./interaction/DragController.ts";
export { SwipeResolver } from "./interaction/SwipeResolver.ts";
export type { GestureState } from "./interaction/GestureState.ts";
export { createGestureState } from "./interaction/GestureState.ts";

export { PluginManager } from "./plugins/PluginManager.ts";
export type { Plugin, PluginContext } from "./plugins/Plugin.ts";
export { Registry } from "./plugins/Registry.ts";
