export interface CommandContext {
  goTo(index: number, animate?: boolean): void;
  getActiveIndex(): number;
  getSlideCount(): number;
  play(): void;
  pause(): void;
  isPlaying(): boolean;
  next(): number;
  previous(): number;
}

export interface Command {
  execute(ctx: CommandContext): void;
}
