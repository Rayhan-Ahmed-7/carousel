import type { NavigationContext, NavigationStrategy } from "./NavigationStrategy.ts";

export class FiniteNavigation implements NavigationStrategy {
  next(ctx: NavigationContext): number {
    const max = Math.max(0, ctx.slideCount - ctx.slidesPerView);
    return Math.min(ctx.activeIndex + 1, max);
  }
  previous(ctx: NavigationContext): number {
    return Math.max(ctx.activeIndex - 1, 0);
  }
  goTo(ctx: NavigationContext, target: number): number {
    const max = Math.max(0, ctx.slideCount - ctx.slidesPerView);
    return Math.max(0, Math.min(target, max));
  }
}
