import { ConsoleContextHelper } from '../core/ConsoleContext';
import { Slot, ConsoleSlotCtx, Next } from '../slot/Slot';
import { SlotManager } from '../slot/SlotManager';
import { compose, Composer } from '../util/compose';
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

  public/*protected*/ createMiddleware(globalToGroup?: Composer): ConsoleSlotCtx {
    const builders = this.builders;

    return (ctx, next) => {
      const { command } = ctx;
      const middleware: Array<Slot<Slot.Console> | ConsoleSlotCtx> = [];

      for (let i = 0; i < builders.length; ++i) {
        const builder = builders[i]!;
        if (builder.match(command)) {
          middleware.push(this.reset, ...builder.getSlots());
        }
      }

      // No command is found
      if (!middleware.length) {
        return next();
      }

      globalToGroup && middleware.unshift(globalToGroup);

      return compose(middleware)(ctx, next);
    };
  }

  protected reset(ctx: ConsoleContextHelper, next: Next) {
    ctx.commandMatched = true;
    // @ts-expect-error
    ctx.options = undefined;

    return next();
  }
}
