export class FocusManager {
  private el: HTMLElement | null = null;

  attach(el: HTMLElement): void {
    this.el = el;
    if (!el.hasAttribute("role")) el.setAttribute("role", "region");
    if (!el.hasAttribute("aria-roledescription")) {
      el.setAttribute("aria-roledescription", "carousel");
    }
  }

  detach(): void {
    this.el = null;
  }

  focus(): void {
    this.el?.focus();
  }
}
