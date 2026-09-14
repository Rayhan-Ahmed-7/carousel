export type Listener<T> = (payload: T) => void;

export class EventBus<Events> {
  private listeners = new Map<keyof Events, Set<Listener<unknown>>>()

  on<K extends keyof Events>(event: K, fn: Listener<Events[K]>): () => void {
    let set = this.listeners.get(event)
    if (!set) {
      set = new Set()
      this.listeners.set(event, set)
    }
    set.add(fn as Listener<unknown>)
    return () => this.off(event, fn)
  }

  off<K extends keyof Events>(event: K, fn: Listener<Events[K]>): void {
    this.listeners.get(event)?.delete(fn as Listener<unknown>)
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const set = this.listeners.get(event)
    if (!set) return
    for (const fn of Array.from(set)) (fn as Listener<Events[K]>)(payload)
  }

  clear(): void {
    this.listeners.clear()
  }
}
