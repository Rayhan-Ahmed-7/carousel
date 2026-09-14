export interface KeyboardHandlers {
  onNext: () => void;
  onPrevious: () => void;
  onFirst?: () => void;
  onLast?: () => void;
}

export class KeyboardAdapter {
  private el: HTMLElement | null = null
  private handlers: KeyboardHandlers | null = null

  attach(el: HTMLElement, handlers: KeyboardHandlers): void {
    this.detach()
    this.el = el
    this.handlers = handlers
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0')
    el.addEventListener('keydown', this.onKeyDown)
  }

  detach(): void {
    this.el?.removeEventListener('keydown', this.onKeyDown)
    this.el = null
    this.handlers = null
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (!this.handlers) return
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        this.handlers.onNext()
        e.preventDefault()
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        this.handlers.onPrevious()
        e.preventDefault()
        break
      case 'Home':
        this.handlers.onFirst?.()
        e.preventDefault()
        break
      case 'End':
        this.handlers.onLast?.()
        e.preventDefault()
        break
    }
  }
}
