import type { NavigationContext, NavigationStrategy } from "./NavigationStrategy.ts";

export class RewindNavigation implements NavigationStrategy {
  next(ctx: NavigationContext): number {
    const max = Math.max(0, ctx.slideCount - ctx.slidesPerView);
    return ctx.activeIndex >= max ? 0 : ctx.activeIndex + 1;
  }
  previous(ctx: NavigationContext): number {
    const max = Math.max(0, ctx.slideCount - ctx.slidesPerView);
    return ctx.activeIndex <= 0 ? max : ctx.activeIndex - 1;
  }
  goTo(ctx: NavigationContext, target: number): number {
    const max = Math.max(0, ctx.slideCount - ctx.slidesPerView);
    if (target < 0) return max;
    if (target > max) return 0;
    return target;
  }
}
