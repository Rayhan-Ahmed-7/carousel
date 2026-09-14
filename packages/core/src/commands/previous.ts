import type { Command, CommandContext } from './Command'

export class PreviousCommand implements Command {
  execute(ctx: CommandContext): void {
    const target = ctx.previous()
    ctx.goTo(target, true)
  }
}
