import type { Command, CommandContext } from './Command'

export class PauseCommand implements Command {
  execute(ctx: CommandContext): void {
    ctx.pause()
  }
}
