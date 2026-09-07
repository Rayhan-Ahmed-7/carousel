import type { Effect } from "./Effect.ts";

export class EffectRegistry {
  private map = new Map<string, Effect>();

  register(effect: Effect): void {
    this.map.set(effect.name, effect);
  }

  get(name: string): Effect | undefined {
    return this.map.get(name);
  }

  has(name: string): boolean {
    return this.map.has(name);
  }
}
