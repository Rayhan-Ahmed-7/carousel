export type ResizeCallback = (entry: ResizeObserverEntry) => void;

export class ResizeObserverAdapter {
  private observer: ResizeObserver | null = null;
  private cb: ResizeCallback | null = null;
  private el: HTMLElement | null = null;

  observe(el: HTMLElement, cb: ResizeCallback): void {
    this.disconnect();
    this.el = el;
    this.cb = cb;
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", this.handleWindowResize);
      return;
    }
    this.observer = new ResizeObserver((entries) => {
      for (const entry of entries) cb(entry);
    });
    this.observer.observe(el);
  }

  disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
    window.removeEventListener("resize", this.handleWindowResize);
    this.el = null;
    this.cb = null;
  }

  private handleWindowResize = (): void => {
    if (!this.el || !this.cb) return;
    const rect = this.el.getBoundingClientRect();
    this.cb({
      contentRect: rect,
      target: this.el,
    } as unknown as ResizeObserverEntry);
  };
}
