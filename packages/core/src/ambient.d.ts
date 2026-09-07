declare function setTimeout(handler: (...args: unknown[]) => void, timeout?: number): number;
declare function clearTimeout(handle: number): void;
declare function requestAnimationFrame(cb: (time: number) => void): number;
declare function cancelAnimationFrame(handle: number): void;
declare const performance: { now(): number };
