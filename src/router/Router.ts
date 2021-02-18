import { ConsoleSlotCtx, Slot, WebSlotCtx } from '../slot/Slot';
import { SlotManager } from '../slot/SlotManager';
import { Builder } from './Builder';

export abstract class Router<T extends Slot.Mix | Slot.Web | Slot.Console, U extends Builder<T, any, any>> {
  public/*protected*/ builders: U[] = [];

  constructor(
    protected readonly prefix: string,
    protected globalSlots: SlotManager<T, any, any>,
  ) {}

  public/*protected*/ getBuilders(): U[] {
    return this.builders;
  }

  public/*protected*/ getSlotManager(): SlotManager<T, any, any> {
    return this.globalSlots;
  }

  public/*protected*/ abstract createMiddleware(): WebSlotCtx | ConsoleSlotCtx;
}
