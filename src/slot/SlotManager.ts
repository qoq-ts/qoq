import { createSlot } from '../util/createSlot';
import { Slot, SlotCtx } from './Slot';

export class SlotManager<T extends Slot.Mix | Slot.Web | Slot.Console, Props = {}, State = {}> {
  protected prev: SlotManager<T, any, any> | null = null;
  protected isTrunk: boolean = false;
  protected routers: Array<SlotCtx<T>> = [];

  public static use<T extends Slot.Mix | Slot.Web | Slot.Console, P = {}, S = {}>(
    this: new (...args: any[]) => SlotManager<T, any, any>,
    slot: Slot<T, P, S> | SlotManager<T, P, S> | SlotCtx<Slot.Web extends T ? Slot.Web : Slot.Console> | null
  ): SlotManager<T, P, S> {
    // @ts-ignore
    return new SlotManager([]).use(slot);
  }

  constructor(protected slots: Slot<T, any, any>[] = []) {};

  use<P, S>(slot: Slot<T, P, S> | SlotManager<T, P, S> | SlotCtx<Slot.Web extends T ? Slot.Web : Slot.Console, Props, State> | null): SlotManager<T, Props & P, State & S> {
    if (slot === null) {
      return this;
    }

    const manager = new SlotManager(
      typeof slot === 'function'
        ? [createSlot('mix', slot as SlotCtx<T, any, any>) as Slot<T>]
        : slot instanceof SlotManager
          ? slot.slots
          : [slot]
    );
    manager.prev = this;

    return manager;
  }

  public/*protected*/ getTrunkSlotsAndRouters() {
    type Mix = (Slot<T, Props, State> | SlotCtx<T, Props, State>)[];
    let mixData: Mix = [];
    let prevManager: SlotManager<T, any, any> | null = this;

    while (prevManager) {
      if (prevManager.isTrunk) {
        mixData = ([] as Mix).concat(prevManager.slots, prevManager.routers, mixData);
      }
      prevManager = prevManager.prev;
    }

    return mixData;
  }

  public/*protected*/ getTrunkNode(): SlotManager<T, any, any> | null {
    let prevManager: SlotManager<T, any, any> | null = this;

    while (prevManager) {
      if (prevManager.isTrunk) {
        return prevManager;
      }
      prevManager = prevManager.prev;
    }

    return null;
  }

  public/*protected*/ getBranchSlots(): Slot<T, any, any>[] {
    let slots: Slot<T, Props, State>[] = [];
    let prevManager: SlotManager<T, any, any> | null = this;

    while (prevManager && !prevManager.isTrunk) {
      slots = prevManager.slots.concat(slots);
      prevManager = prevManager.prev;
    }

    return slots;
  }

  public/*protected*/ setTrunk(): void {
    let prevManager: SlotManager<T, any, any> | null = this;

    do { prevManager.isTrunk = true; } while (prevManager = prevManager.prev);
  }

  public/*protected*/ mountRouter(router: SlotCtx<T>) {
    if (!this.isTrunk) {
      throw new ReferenceError('Only tree trunk can mount router');
    }
    this.routers.push(router);
  }
}

export class WebSlotManager<Props = {}, State = {}> extends SlotManager<Slot.Mix | Slot.Web, Props, State> {}

export class ConsoleSlotManager<Props = {}, State = {}> extends SlotManager<Slot.Mix | Slot.Console, Props, State> {}
