import type { Command, CommandContext } from "./Command.ts";

export class PlayCommand implements Command {
  execute(ctx: CommandContext): void {
    ctx.play();
  }
}
