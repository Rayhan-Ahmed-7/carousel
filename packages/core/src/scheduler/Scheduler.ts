export type FrameCallback = (time: number) => void;

export interface SchedulerAPI {
  now(): number;
  raf(cb: FrameCallback): number;
  cancel(handle: number): void;
}

export class Scheduler implements SchedulerAPI {
  now(): number {
    return typeof performance !== 'undefined' ? performance.now() : Date.now()
  }

  raf(cb: FrameCallback): number {
    if (typeof requestAnimationFrame !== 'undefined') {
      return requestAnimationFrame(cb)
    }
    return setTimeout(() => cb(this.now()), 16) as unknown as number
  }

  cancel(handle: number): void {
    if (typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(handle)
    } else {
      clearTimeout(handle as unknown as ReturnType<typeof setTimeout>)
    }
  }
}
