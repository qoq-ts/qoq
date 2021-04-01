import compose, { Middleware } from 'koa-compose';
import { ConsoleSlotCtx, MixSlotCtx, Slot, WebSlotCtx } from '../slot/Slot';
import { toArray } from './toArray';

export const testMiddleware = <P, S>(slot:
  | Slot<any, P, S>
  | WebSlotCtx<P, S>
  | ConsoleSlotCtx<P, S>
  | MixSlotCtx<P, S>
  | (Slot<any, P, S> | WebSlotCtx<P, S> | ConsoleSlotCtx<P, S> | MixSlotCtx<P, S>)[]
) => {
  return <U extends { [key: string]: any }>(ctx: U): Promise<U & P & { state: S }> => {
    const middleware = toArray(slot).reduce<Middleware<any>[]>((carry, item) => {
      if (item instanceof Slot) {
        carry.push(...item.collect());
      } else {
        carry.push(item);
      }

      return carry;
    }, []);

    // @ts-expect-error
    ctx.state ||= {};

    return compose(middleware)(ctx).then(() => ctx as any);
  };
};
