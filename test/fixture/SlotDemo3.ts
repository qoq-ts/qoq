import { Slot } from '../../src';

export interface Slot1Props {
  testData3: string;
}

export class SlotDemo3 extends Slot<Slot.Web, Slot1Props> {
  constructor(data: string) {
    super();
    this.use((ctx, next) => {
      ctx.testData3 = data;

      return next();
    });
  }
}
