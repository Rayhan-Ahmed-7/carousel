export interface NavigationContext {
  activeIndex: number;
  slideCount: number;
  slidesPerView: number;
}

export interface NavigationStrategy {
  next(ctx: NavigationContext): number;
  previous(ctx: NavigationContext): number;
  goTo(ctx: NavigationContext, target: number): number;
}
