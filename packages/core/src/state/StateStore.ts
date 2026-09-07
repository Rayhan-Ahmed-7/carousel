import type { CarouselState } from "../types/index.ts";

export type StateListener = (state: CarouselState, prev: CarouselState) => void;

export class StateStore {
  private state: CarouselState;
  private listeners = new Set<StateListener>();

  constructor(initial: CarouselState) {
    this.state = { ...initial };
  }

  getState(): CarouselState {
    return this.state;
  }

  setState(patch: Partial<CarouselState>): void {
    const prev = this.state;
    const next = { ...prev, ...patch };
    let changed = false;
    for (const key of Object.keys(patch) as (keyof CarouselState)[]) {
      if (prev[key] !== next[key]) {
        changed = true;
        break;
      }
    }
    if (!changed) return;
    this.state = next;
    for (const fn of Array.from(this.listeners)) fn(next, prev);
  }

  subscribe(fn: StateListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}
