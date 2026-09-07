import type { NavigationContext, NavigationStrategy } from "./NavigationStrategy.ts";

export class InfiniteNavigation implements NavigationStrategy {
  next(ctx: NavigationContext): number {
    if (ctx.slideCount === 0) return 0;
    return (ctx.activeIndex + 1) % ctx.slideCount;
  }
  previous(ctx: NavigationContext): number {
    if (ctx.slideCount === 0) return 0;
    return (ctx.activeIndex - 1 + ctx.slideCount) % ctx.slideCount;
  }
  goTo(ctx: NavigationContext, target: number): number {
    if (ctx.slideCount === 0) return 0;
    const t = target % ctx.slideCount;
    return t < 0 ? t + ctx.slideCount : t;
  }
}
