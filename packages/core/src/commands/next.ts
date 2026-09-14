import type { Command, CommandContext } from './Command'

export class NextCommand implements Command {
  execute(ctx: CommandContext): void {
    const target = ctx.next()
    ctx.goTo(target, true)
  }
}
