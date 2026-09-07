export class Registry<T> {
  private map = new Map<string, T>();
  register(key: string, value: T): void {
    this.map.set(key, value);
  }
  get(key: string): T | undefined {
    return this.map.get(key);
  }
  has(key: string): boolean {
    return this.map.has(key);
  }
}
