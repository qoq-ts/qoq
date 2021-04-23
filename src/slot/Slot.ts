import { Next } from 'koa';
import { ConsoleCtx } from '../core/ConsoleContext';
import { WebCtx } from '../core/WebContext';

export type MixSlotCtx<Props = {}, State = {}> = (ctx: WebCtx<Props, State> | ConsoleCtx<Props, State>, next: Next) => any;
export type WebSlotCtx<Props = {}, State = {}> = (ctx: WebCtx<Props, State>, next: Next) => any;
export type ConsoleSlotCtx<Props = {}, State = {}> = (ctx: ConsoleCtx<Props, State>, next: Next) => any;

export type SlotCtx<Type extends SlotAllType, Props = {}, State = {}> = Type extends Slot.Web
  ? WebSlotCtx<Props, State>
  : Type extends Slot.Console
    ? ConsoleSlotCtx<Props, State>
    : MixSlotCtx<Props, State>;

export namespace Slot {
  export type Web = 'web';
  export type Console = 'console';
  export type Mix = 'mix';
}

export type SlotAllType = Slot.Mix | Slot.Web | Slot.Console;

export abstract class Slot<
  Type extends SlotAllType = Slot.Mix,
  Props = {},
  State = {}
> {
  private middleware: SlotCtx<Type, Props, State>[] = [];

  public/*protected*/ collect(): SlotCtx<Type, Props, State>[] {
    return this.middleware;
  }

  protected use(fn: SlotCtx<Type, Props, State>): {
    use: Slot<Type, Props, State>['use'];
  };
  protected use<P, S>(
    slot: Type extends Slot.Web
      ? Slot<Slot.Web, P, S> | Slot<Slot.Mix, P, S>
      : Type extends Slot.Console
        ? Slot<Slot.Console, P, S> | Slot<Slot.Mix, P, S>
        : Slot<Slot.Web, P, S> | Slot<Slot.Mix, P, S> | Slot<Slot.Console, P, S>
  ): {
    use: Slot<Type, P & Props, S & State>['use'];
  };
  protected use(fn: SlotCtx<Type, any, any> | Slot<any>): object {
    if (typeof fn === 'function') {
      this.middleware.push(fn);
    } else{
      this.middleware.push(...fn.collect() as any[]);
    }

    return this;
  }

  protected assume<P, S>(
    _slot: Type extends Slot.Web
      ? new(...args: any[]) => Slot<Slot.Web, P, S> | Slot<Slot.Mix, P, S>
      : Type extends Slot.Console
        ? new(...args: any[]) => Slot<Slot.Console, P, S> | Slot<Slot.Mix, P, S>
        : new(...args: any[]) => Slot<Slot.Web, P, S> | Slot<Slot.Mix, P, S> | Slot<Slot.Console, P, S>
  ): {
    use: Slot<Type, P & Props, S & State>['use'];
    assume: Slot<Type, P & Props, S & State>['assume'];
  } {
    // @ts-expect-error
    return this;
  }
}
