export interface GestureState {
  active: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  velocityX: number;
  velocityY: number;
  startTime: number;
  lastTime: number;
}

export function createGestureState(): GestureState {
  return {
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    velocityX: 0,
    velocityY: 0,
    startTime: 0,
    lastTime: 0,
  }
}
