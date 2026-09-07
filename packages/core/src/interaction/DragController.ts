import type { Axis } from "../types/index.ts";
import { createGestureState, type GestureState } from "./GestureState.ts";

export interface PointerSample {
  x: number;
  y: number;
  time: number;
}

export class DragController {
  private gesture: GestureState = createGestureState();

  start(sample: PointerSample): GestureState {
    this.gesture = createGestureState();
    this.gesture.active = true;
    this.gesture.startX = sample.x;
    this.gesture.startY = sample.y;
    this.gesture.currentX = sample.x;
    this.gesture.currentY = sample.y;
    this.gesture.startTime = sample.time;
    this.gesture.lastTime = sample.time;
    return this.gesture;
  }

  move(sample: PointerSample): GestureState {
    if (!this.gesture.active) return this.gesture;
    const dt = Math.max(1, sample.time - this.gesture.lastTime);
    this.gesture.velocityX = (sample.x - this.gesture.currentX) / dt;
    this.gesture.velocityY = (sample.y - this.gesture.currentY) / dt;
    this.gesture.currentX = sample.x;
    this.gesture.currentY = sample.y;
    this.gesture.deltaX = sample.x - this.gesture.startX;
    this.gesture.deltaY = sample.y - this.gesture.startY;
    this.gesture.lastTime = sample.time;
    return this.gesture;
  }

  end(): GestureState {
    this.gesture.active = false;
    return this.gesture;
  }

  get state(): GestureState {
    return this.gesture;
  }
}

export function progressDelta(gesture: GestureState, axis: Axis, stride: number): number {
  if (stride <= 0) return 0;
  const delta = axis === "horizontal" ? gesture.deltaX : gesture.deltaY;
  return -delta / stride;
}
