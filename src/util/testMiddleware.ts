import compose, { Middleware } from 'koa-compose';
import { ConsoleSlotCtx, MixSlotCtx, Slot, WebSlotCtx } from '../slot/Slot';

type Collection<P, S> =
  | Slot<any, P, S>
  | WebSlotCtx<P, S>
  | ConsoleSlotCtx<P, S>
  | MixSlotCtx<P, S>;
type ReturnFn<P, S> = <U extends { [key: string]: any }>(ctx: U) => Promise<U & P & { state: S }>;

export function testMiddleware<P, S>(slot1: Collection<P, S>): ReturnFn<P, S>;
export function testMiddleware<P1, S1, P2, S2>(
  slot1: Collection<P1, S1>,
  slot2: Collection<P2, S2>,
): ReturnFn<P1 & P2, S1 & S2>;
export function testMiddleware<P1, S1, P2, S2>(
  slot1: Collection<P1, S1>,
  slot2: Collection<P2, S2>,
): ReturnFn<P1 & P2, S1 & S2>;
export function testMiddleware<P1, S1, P2, S2, P3, S3>(
  slot1: Collection<P1, S1>,
  slot2: Collection<P2, S2>,
  slot3: Collection<P3, S3>,
): ReturnFn<P1 & P2 & P3, S1 & S2 & S3>;
export function testMiddleware<P1, S1, P2, S2, P3, S3, P4, S4>(
  slot1: Collection<P1, S1>,
  slot2: Collection<P2, S2>,
  slot3: Collection<P3, S3>,
  slot4: Collection<P4, S4>,
): ReturnFn<P1 & P2 & P3 & P4, S1 & S2 & S3 & S4>;
export function testMiddleware<P1, S1, P2, S2, P3, S3, P4, S4, P5, S5>(
  slot1: Collection<P1, S1>,
  slot2: Collection<P2, S2>,
  slot3: Collection<P3, S3>,
  slot4: Collection<P4, S4>,
  slot5: Collection<P5, S5>,
): ReturnFn<P1 & P2 & P3 & P4 & P5, S1 & S2 & S3 & S4 & S5>;

export function testMiddleware<P, S>(...args: Collection<P, S>[]) {
  return <U extends { [key: string]: any }>(ctx: U): Promise<U & P & { state: S }> => {
    const middleware = args.reduce<Middleware<any>[]>((carry, item) => {
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
}
