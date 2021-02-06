import { ConsoleContextHelper } from '../core/ConsoleContext';
import { WebContextHelper } from '../core/WebContext';

export type Next = () => Promise<any>;

export type WebSlot<Props = {}, State = {}> = Slot<Slot.Web, Props, State> | Slot<Slot.Mix, Props, State>;
export type ConsoleSlot<Props = {}, State = {}> = Slot<Slot.Console, Props, State> | Slot<Slot.Mix, Props, State>;
export type MixSlot<Props = {}, State = {}> = WebSlot<Props, State> | ConsoleSlot<Props, State>;

export type MixSlotCtx<Props = {}, State = {}> = (ctx: WebContextHelper<Props, State> | ConsoleContextHelper<Props, State>, next: Next) => any;
export type WebSlotCtx<Props = {}, State = {}> = (ctx: WebContextHelper<Props, State>, next: Next) => any;
export type ConsoleSlotCtx<Props = {}, State = {}> = (ctx: ConsoleContextHelper<Props, State>, next: Next) => any;

type SlotCtx<Type, Props, State> = Type extends Slot.Mix
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
      ? WebSlot<P, S>
      : Type extends Slot.Console
        ? ConsoleSlot<P, S>
        : MixSlot<P, S>
  ): {
    use: Slot<Type, P & Props, S & State>['use'];
  };
  protected use(fn: SlotCtx<Type, Props, State> | MixSlot<any, any>): object {
    if (typeof fn === 'function') {
      this.middleware.push(fn);
    } else{
      this.middleware.push(...fn.collect() as any[]);
    }

    return this;
  }
}
