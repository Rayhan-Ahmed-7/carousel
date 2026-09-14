import type { EasingFn } from '../types/index'
import type { SchedulerAPI } from '../scheduler/Scheduler'

export interface AnimationOptions {
  from: number;
  to: number;
  duration: number;
  easing: EasingFn;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
}

export class AnimationEngine {
  private handle: number | null = null

  constructor(private scheduler: SchedulerAPI) {}

  animate(opts: AnimationOptions): void {
    this.cancel()
    const start = this.scheduler.now()
    const step = (now: number) => {
      const elapsed = now - start
      const t = opts.duration > 0 ? Math.min(1, elapsed / opts.duration) : 1
      const eased = opts.easing(t)
      const value = opts.from + (opts.to - opts.from) * eased
      opts.onUpdate(value)
      if (t < 1) {
        this.handle = this.scheduler.raf(step)
      } else {
        this.handle = null
        opts.onComplete?.()
      }
    }
    this.handle = this.scheduler.raf(step)
  }

  cancel(): void {
    if (this.handle != null) {
      this.scheduler.cancel(this.handle)
      this.handle = null
    }
  }

  get isRunning(): boolean {
    return this.handle != null
  }
}
