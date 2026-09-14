import type { SlideVisualState } from '../../types/index'
import type { EffectContext } from '../effects/Effect'

export interface Modifier {
  readonly name: string;
  apply(states: SlideVisualState[], ctx: EffectContext): SlideVisualState[];
}
