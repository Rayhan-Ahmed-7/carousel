import type { Command, CommandContext } from './Command'

export class GoToCommand implements Command {
  constructor(private index: number, private animate: boolean = true) {}
  execute(ctx: CommandContext): void {
    ctx.goTo(this.index, this.animate)
  }
}
