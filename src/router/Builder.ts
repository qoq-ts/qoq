import { Next } from 'koa';
import { Slot, SlotAllType, SlotCtx } from '../slot/Slot';
import { SlotManager, Use } from '../slot/SlotManager';

export abstract class Builder<
  T extends SlotAllType,
  Props = any,
  State = any,
  Payload = {},
> {
  protected slots = new SlotManager<T, any, any>([]);
  protected payload: Record<string, (ctx: any) => any> = {};

  public use<P, S>(
    slot: Use<T, P, S>,
  ): Builder<T, Props & P, State & S, Payload> {
    this.slots = this.slots.use(slot);
    return this;
  }

  public /*protected*/ getMiddleware() {
    return this.slots.getBranchMiddleware();
  }

  public abstract /*protected*/ toJSON(): object;

  protected useAction(fn: (ctx: any, payload: Payload, next: Next) => any) {
    const payload = Object.entries(this.payload);

    const middleware: SlotCtx<Slot.Mix> = (ctx, next) => {
      // @ts-expect-error
      const parsed: Payload = {};
      const promises: Promise<any>[] = [];

      for (let i = 0; i < payload.length; ++i) {
        const key = payload[i]![0] as keyof Payload;
        const result = payload[i]![1](ctx) as Promise<any>;

        promises.push(
          result.then((data) => {
            parsed[key] = data;
          }),
        );
      }

      return Promise.all(promises).then(() => fn(ctx, parsed, next));
    };

    // @ts-expect-error
    this.use(middleware);
  }
}
