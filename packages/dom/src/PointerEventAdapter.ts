import type { PointerSample } from '@carousel/core'

export interface PointerAdapterHandlers {
  onDown: (sample: PointerSample) => void;
  onMove: (sample: PointerSample) => void;
  onUp: (sample: PointerSample) => void;
}

export class PointerEventAdapter {
  private el: HTMLElement | null = null
  private handlers: PointerAdapterHandlers | null = null
  private pointerId: number | null = null

  attach(el: HTMLElement, handlers: PointerAdapterHandlers): void {
    this.detach()
    this.el = el
    this.handlers = handlers
    el.addEventListener('pointerdown', this.onDown)
    el.addEventListener('pointermove', this.onMove)
    el.addEventListener('pointerup', this.onUp)
    el.addEventListener('pointercancel', this.onUp)
    el.addEventListener('pointerleave', this.onLeave)
  }

  detach(): void {
    if (!this.el) return
    this.el.removeEventListener('pointerdown', this.onDown)
    this.el.removeEventListener('pointermove', this.onMove)
    this.el.removeEventListener('pointerup', this.onUp)
    this.el.removeEventListener('pointercancel', this.onUp)
    this.el.removeEventListener('pointerleave', this.onLeave)
    this.el = null
    this.handlers = null
    this.pointerId = null
  }

  private onDown = (e: PointerEvent): void => {
    if (!this.handlers || !this.el) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (
      e.target instanceof Element &&
      e.target.closest('button, a, input, select, textarea, [data-carousel-control]')
    ) {
      return
    }
    this.pointerId = e.pointerId
    this.el.setPointerCapture?.(e.pointerId)
    this.handlers.onDown({ x: e.clientX, y: e.clientY, time: e.timeStamp })
  }

  private onMove = (e: PointerEvent): void => {
    if (!this.handlers) return
    if (this.pointerId == null || this.pointerId !== e.pointerId) return
    this.handlers.onMove({ x: e.clientX, y: e.clientY, time: e.timeStamp })
  }

  private onUp = (e: PointerEvent): void => {
    if (!this.handlers) return
    if (this.pointerId == null || this.pointerId !== e.pointerId) return
    this.el?.releasePointerCapture?.(e.pointerId)
    this.pointerId = null
    this.handlers.onUp({ x: e.clientX, y: e.clientY, time: e.timeStamp })
  }

  private onLeave = (e: PointerEvent): void => {
    if (this.pointerId == null || this.pointerId !== e.pointerId) return
    this.onUp(e)
  }
}
