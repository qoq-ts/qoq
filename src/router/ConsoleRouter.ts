import { ConsoleContextHelper } from '../core/ConsoleContext';
import { Slot, ConsoleSlot, ConsoleSlotCtx, Next } from '../slot/Slot';
import { ConsoleSlotManager, SlotManager } from '../slot/SlotManager';
import { compose, Composer } from '../util/compose';
import { stringToArray } from '../util/stringToArray';
import { ConsoleBuilder } from './ConsoleBuilder';
import { Router } from './Router';

interface ConsoleRouterOptions<Props, State> {
  prefix?: string;
  slots?: SlotManager<Slot.Console | Slot.Mix, Props, State>,
}

export const createConsoleRouter = <Props, State, P, S>(
  globalSlots: SlotManager<Slot.Console | Slot.Mix, Props, State>,
  options: ConsoleRouterOptions<P, S> = {}
): ConsoleRouter<Props & P, State & S> => {
  return new ConsoleRouter(globalSlots, options);
};

export class ConsoleRouter<Props = any, State = any> extends Router<Slot.Console | Slot.Mix, ConsoleBuilder<any, any>> {
  constructor(
    globalSlots: SlotManager<Slot.Console | Slot.Mix, any, any>,
    options: ConsoleRouterOptions<Props, State>
  ) {
    super(options.prefix || '', globalSlots, options.slots || ConsoleSlotManager);
  }

  public command(command: string | string[]): ConsoleBuilder<Props, State> {
    const builder = new ConsoleBuilder(this.prefix, stringToArray(command));
    this.builders.push(builder);
    return builder;
  }

  public/*protected*/ createMiddleware(globalToLocal?: Composer): ConsoleSlotCtx {
    const builders = this.builders;
    const groupSlots = this.groupSlots.getSlots();

    return (ctx, next) => {
      const { command } = ctx;
      const middleware: Array<ConsoleSlot | ConsoleSlotCtx> = [];

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

      middleware.unshift(...groupSlots);
      globalToLocal && middleware.unshift(globalToLocal);

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
