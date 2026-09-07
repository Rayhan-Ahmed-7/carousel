import { DragController, progressDelta, type PointerSample } from "./DragController.ts";
import { SwipeResolver, type SwipeDecision } from "./SwipeResolver.ts";
import type { GestureState } from "./GestureState.ts";
import type { Axis } from "../types/index.ts";

export interface InteractionCallbacks {
  onDragStart: () => void;
  onDragMove: (progressDelta: number, gesture: GestureState) => void;
  onDragEnd: (decision: SwipeDecision, gesture: GestureState) => void;
}

export interface InteractionConfig {
  axis: Axis;
  stride: number;
  threshold: number;
  velocityThreshold: number;
}

export class InteractionEngine {
  private drag = new DragController();
  private swipe = new SwipeResolver();

  constructor(private config: InteractionConfig, private cb: InteractionCallbacks) {}

  update(config: Partial<InteractionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  start(sample: PointerSample): void {
    this.drag.start(sample);
    this.cb.onDragStart();
  }

  move(sample: PointerSample): void {
    const g = this.drag.move(sample);
    const dp = progressDelta(g, this.config.axis, this.config.stride);
    this.cb.onDragMove(dp, g);
  }

  end(): void {
    const g = this.drag.end();
    const decision = this.swipe.resolve({
      gesture: g,
      axis: this.config.axis,
      threshold: this.config.threshold,
      velocityThreshold: this.config.velocityThreshold,
    });
    this.cb.onDragEnd(decision, g);
  }
}
