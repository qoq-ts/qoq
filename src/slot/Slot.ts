import { ConsoleContextHelper } from '../core/ConsoleContext';
import { WebContextHelper } from '../core/WebContext';

export type Next = () => Promise<any>;

export type MixSlotCtx<Props = {}, State = {}> = (ctx: WebContextHelper<Props, State> | ConsoleContextHelper<Props, State>, next: Next) => any;
export type WebSlotCtx<Props = {}, State = {}> = (ctx: WebContextHelper<Props, State>, next: Next) => any;
export type ConsoleSlotCtx<Props = {}, State = {}> = (ctx: ConsoleContextHelper<Props, State>, next: Next) => any;

type SlotCtx<Type, Props = {}, State = {}> = Type extends Slot.Mix
  ? MixSlotCtx<Props, State>
  : Type extends Slot.Console
    ? ConsoleSlotCtx<Props, State>
    : WebSlotCtx<Props, State>;

export namespace Slot {
  export type Web = 'web';
  export type Console = 'console';
  export type Mix = 'mix';
}

export abstract class Slot<
  Type extends Slot.Mix | Slot.Web | Slot.Console = Slot.Mix,
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
}
