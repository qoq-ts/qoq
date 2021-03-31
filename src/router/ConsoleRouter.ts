import compose, { Middleware } from 'koa-compose';
import { ConsoleCtx } from '../core/ConsoleContext';
import { Slot, ConsoleSlotCtx } from '../slot/Slot';
import { SlotManager } from '../slot/SlotManager';
import { toArray } from '../util/toArray';
import { ConsoleBuilder } from './ConsoleBuilder';
import { Router } from './Router';

interface ConsoleRouterOptions<Props, State> {
  prefix?: string;
  slots: SlotManager<Slot.Console | Slot.Mix, Props, State>,
}

export class ConsoleRouter<Props = any, State = any> extends Router<Slot.Console | Slot.Mix, ConsoleBuilder<any, any>> {
  constructor(options: ConsoleRouterOptions<Props, State>) {
    super(options.prefix || '', options.slots);
  }

  public command(command: string | string[]): ConsoleBuilder<Props, State> {
    const builder = new ConsoleBuilder(this.prefix, toArray(command));
    this.builders.push(builder);
    return builder;
  }

  public/*protected*/ createMiddleware(): ConsoleSlotCtx {
    const builders = this.builders;
    const groupSlots = this.globalSlots.getBranchMiddleware();
    const groupCompose = groupSlots.length > 0 && compose(groupSlots);

    return (ctx, next) => {
      const { command } = ctx;
      const middleware: Middleware<ConsoleCtx>[] = [];
      let matched: boolean = false;
      groupCompose && middleware.push(groupCompose);

      for (let i = 0; i < builders.length; ++i) {
        const builder = builders[i]!;
        if (builder.match(command)) {
          matched = matched || true;
          middleware.push(
            (_ctx, _next) => (_ctx.commandMatched = true, _next()),
            ...builder.getMiddleware()
          );
        }
      }

      // No command is found
      if (!matched) {
        return next();
      }

      return compose(middleware)(ctx, next);
    };
  }
}
