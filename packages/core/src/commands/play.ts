import type { Command, CommandContext } from './Command'

export class PlayCommand implements Command {
  execute(ctx: CommandContext): void {
    ctx.play()
  }
}
