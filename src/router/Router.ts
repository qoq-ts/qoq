import { ConsoleSlotCtx, SlotAllType, WebSlotCtx } from '../slot/Slot';
import { SlotManager } from '../slot/SlotManager';
import { Builder } from './Builder';

export abstract class Router<
  T extends SlotAllType,
  U extends Builder<T, any, any>,
> {
  public /*protected*/ builders: U[] = [];

  constructor(
    protected readonly prefix: string,
    protected globalSlots: SlotManager<T, any, any>,
  ) {}

  public /*protected*/ getBuilders(): U[] {
    return this.builders;
  }

  public /*protected*/ getSlotManager(): SlotManager<T, any, any> {
    return this.globalSlots;
  }

  public abstract /*protected*/ createMiddleware(): WebSlotCtx | ConsoleSlotCtx;
}
