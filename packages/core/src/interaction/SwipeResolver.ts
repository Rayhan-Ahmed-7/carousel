import type { Axis } from '../types/index'
import type { GestureState } from './GestureState'

export interface SwipeInput {
  gesture: GestureState;
  axis: Axis;
  threshold: number;
  velocityThreshold: number;
}

export type SwipeDecision = 'next' | 'previous' | 'stay';

export class SwipeResolver {
  resolve(input: SwipeInput): SwipeDecision {
    const isH = input.axis === 'horizontal'
    const delta = isH ? input.gesture.deltaX : input.gesture.deltaY
    const velocity = isH ? input.gesture.velocityX : input.gesture.velocityY

    if (Math.abs(delta) > input.threshold || Math.abs(velocity) > input.velocityThreshold) {
      return delta < 0 ? 'next' : 'previous'
    }
    return 'stay'
  }
}
