import { ConsoleSlotCtx, Slot, WebSlotCtx } from './Slot';

type Fn = WebSlotCtx<any, any> | ConsoleSlotCtx<any, any>;

export const Action = (fn: Fn): _Action => {
  return new _Action(fn);
};

class _Action extends Slot<Slot.Mix> {
  constructor(fn: Fn) {
    super();
    this.use(fn);
  }
}
