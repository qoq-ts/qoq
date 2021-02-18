import { ConsoleSlotCtx, Slot, WebSlotCtx } from './Slot';

export class SlotManager<T extends Slot.Mix | Slot.Web | Slot.Console, Props = {}, State = {}> {
  protected prev: SlotManager<T, any, any> | null = null;
  protected isTrunk: boolean = false;
  protected routers: Array<WebSlotCtx | ConsoleSlotCtx> = [];

  constructor(protected slots: Slot<T, any, any>[] = []) {};

  use<P, S>(slot: Slot<T, P, S> | SlotManager<T, P, S>): SlotManager<T, Props & P, State & S> {
    const manager = new SlotManager(slot instanceof SlotManager ? slot.slots : [slot]);

    manager.prev = this;

    return manager;
  }

  public/*protected*/ getTrunkSlotsAndRouters(): (Slot<T, Props, State> | WebSlotCtx | ConsoleSlotCtx)[] {
    let mixData: (Slot<T, Props, State> | WebSlotCtx | ConsoleSlotCtx)[] = [];
    let prevManager: SlotManager<T, any, any> | null = this;

    while (prevManager && prevManager.isTrunk) {
      mixData = mixData.concat(prevManager.slots, prevManager.routers);
    }

    return mixData;
  }

  public/*protected*/ getTrunkNode(): SlotManager<T, any, any> | null {
    let prevManager: SlotManager<T, any, any> | null = this;

    while (prevManager && prevManager.isTrunk) {
      return prevManager;
    }

    return null;
  }

  public/*protected*/ getBranchSlots(): Slot<T, any, any>[] {
    let slots: Slot<T, Props, State>[] = [];
    let prevManager: SlotManager<T, any, any> | null = this;

    while (prevManager && !prevManager.isTrunk) {
      slots = slots.concat(prevManager.slots);
    }

    return slots;
  }

  public/*protected*/ setTrunk(): void {
    let prev: SlotManager<T, any, any> | null = this;

    do { prev.isTrunk = true; } while (prev = prev.prev);
  }

  public/*protected*/ mountRouter(router: WebSlotCtx | ConsoleSlotCtx) {
    this.routers.push(router);
  }
}

export class WebSlotManager<Props = {}, State = {}> extends SlotManager<Slot.Mix | Slot.Web, Props, State> {
  public static use<P, S>(slot: Slot<Slot.Mix | Slot.Web, P, S> | WebSlotManager<P, S>): WebSlotManager<P, S> {
    return new WebSlotManager([]).use(slot);
  }
}

export class ConsoleSlotManager<Props = {}, State = {}> extends SlotManager<Slot.Mix | Slot.Console, Props, State> {
  public static use<P, S>(slot: Slot<Slot.Mix | Slot.Console, P, S> | ConsoleSlotManager<P, S>): ConsoleSlotManager<P, S> {
    return new ConsoleSlotManager([]).use(slot);
  }
};
