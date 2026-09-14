import type { EasingFn, EasingName } from '../types/index'

export const Easing: Record<EasingName, EasingFn> = {
  linear: (t: number) => t,
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
}

export function resolveEasing(input: EasingFn | EasingName | undefined): EasingFn {
  if (typeof input === 'function') return input
  return Easing[input ?? 'easeOutCubic']
}
