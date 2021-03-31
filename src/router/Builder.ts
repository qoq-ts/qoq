import { Next } from 'koa';
import { Slot, SlotAllType, SlotCtx } from '../slot/Slot';
import { SlotManager, Use } from '../slot/SlotManager';
import { ValidatorType } from '../validator/Validator';

export type Parse<T> = {
  [key in keyof T]: ValidatorType<T[key]>;
};

export abstract class Builder<
  T extends SlotAllType,
  Props = any,
  State = any,
  Payload = {}
> {
  protected slots = new SlotManager<T, any, any>([]);
  protected payload: Record<string, {
    (ctx: any): any;
    usePromise: boolean;
  }> = {};

  public use<P, S>(slot: Use<T, P, S>): Builder<T, Props & P, State & S, Payload> {
    this.slots = this.slots.use(slot);
    return this;
  }

  public/*protected*/ getMiddleware() {
    return this.slots.getBranchMiddleware();
  }

  public/*protected*/ abstract toJSON(): object;

  protected useAction(fn: (ctx: any, payload: Payload, next: Next) => any) {
    const payload = Object.entries(this.payload);
    let usePromise = false;

    for (let i = 0; i < payload.length; ++i) {
      if (payload[i]![1].usePromise) {
        usePromise = true;
        break;
      }
    }

    const middleware: SlotCtx<Slot.Mix> = (ctx, next) => {
      // @ts-expect-error
      const parsed: Payload = {};
      const promises: any[] = [];

      for (let i = 0; i < payload.length; ++i) {
        const key = payload[i]![0] as keyof Payload;
        const result = payload[i]![1](ctx) as Payload[keyof Payload];

        if (usePromise) {
          promises.push(
            Promise.resolve(result).then((data) => {
              parsed[key] = data;
            })
          );
        } else {
          parsed[key] = result;
        }
      }

      if (usePromise) {
        return Promise.all(promises).then(() => fn(ctx, parsed, next));
      }

      return fn(ctx, parsed, next);
    };

    // @ts-expect-error
    this.use(middleware);
  }
}
