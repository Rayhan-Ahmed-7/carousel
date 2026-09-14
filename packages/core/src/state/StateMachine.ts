import type { CarouselStatus } from '../types/index'

const TRANSITIONS: Record<CarouselStatus, CarouselStatus[]> = {
  initializing: ['idle', 'destroyed'],
  idle: ['dragging', 'animating', 'destroyed'],
  dragging: ['settling', 'idle', 'destroyed'],
  settling: ['animating', 'idle', 'destroyed'],
  animating: ['idle', 'dragging', 'destroyed'],
  destroyed: [],
}

export class StateMachine {
  private status: CarouselStatus = 'initializing'
  private listeners = new Set<(s: CarouselStatus, p: CarouselStatus) => void>()

  get current(): CarouselStatus {
    return this.status
  }

  can(next: CarouselStatus): boolean {
    return TRANSITIONS[this.status].includes(next)
  }

  transition(next: CarouselStatus): boolean {
    if (!this.can(next)) return false
    const prev = this.status
    this.status = next
    for (const fn of Array.from(this.listeners)) fn(next, prev)
    return true
  }

  onChange(fn: (s: CarouselStatus, p: CarouselStatus) => void): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }
}
