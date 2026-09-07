import type { SlideVisualState } from "../../types/index.ts";
import type { EffectContext } from "../effects/Effect.ts";

export interface Modifier {
  readonly name: string;
  apply(states: SlideVisualState[], ctx: EffectContext): SlideVisualState[];
}
