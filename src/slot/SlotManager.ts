import { Slot } from './Slot';

export class SlotManager<T extends Slot.Mix | Slot.Web | Slot.Console, Props = {}, State = {}> {
  constructor(protected slots: Slot<T, any, any>[]) {};

  use<P, S>(slot: Slot<T, P, S> | SlotManager<T, P, S>): SlotManager<T, Props & P, State & S> {
    return new SlotManager(
      this.slots.concat(
        slot instanceof SlotManager ? slot.slots : slot
      )
    );
  }

  public/*protected*/ getSlots(): Slot<T, Props, State>[] {
    return this.slots.slice();
  }
}

export const WebSlotManager = new SlotManager<Slot.Mix | Slot.Web>([]);

export const ConsoleSlotManager = new SlotManager<Slot.Mix | Slot.Console>([]);
