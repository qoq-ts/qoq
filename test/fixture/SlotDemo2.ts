import { Slot } from '../../src';

export interface Slot1Props {
  testData2: string;
}

export class SlotDemo2 extends Slot<Slot.Mix, Slot1Props> {
  constructor(data: string) {
    super();
    this.use((ctx, next) => {
      ctx.testData2 = data;

      return next();
    });
  }
}
