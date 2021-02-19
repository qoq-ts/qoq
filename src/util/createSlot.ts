import { WebSlotCtx, ConsoleSlotCtx, MixSlotCtx, Slot } from '../slot/Slot';

export const createSlot = <
    T extends 'web' | 'console' | 'mix',
    J extends WebSlotCtx | ConsoleSlotCtx | MixSlotCtx = T extends 'web' ? WebSlotCtx : T extends 'console' ? ConsoleSlotCtx : MixSlotCtx,
    P extends J = J,
    U extends Slot.Web | Slot.Console | Slot.Mix = T extends 'web' ? Slot.Web : T extends 'console' ? Slot.Console : Slot.Mix
  >(type: T, fn: P): Slot<U> => {
    class Wrapper extends Slot<U> {
      protected readonly slotType = type;

      constructor() {
        super();
        this.use(fn);
      }
    }

    return new Wrapper();
  }
