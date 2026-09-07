import type { Command, CommandContext } from "./Command.ts";

export class PauseCommand implements Command {
  execute(ctx: CommandContext): void {
    ctx.pause();
  }
}
