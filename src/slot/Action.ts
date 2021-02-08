import { ConsoleSlotCtx, Slot, WebSlotCtx } from './Slot';

type Fn = WebSlotCtx<any, any> | ConsoleSlotCtx<any, any>;

export class Action extends Slot<Slot.Mix> {
  constructor(fn: Fn) {
    super();
    this.use(fn);
  }
}
