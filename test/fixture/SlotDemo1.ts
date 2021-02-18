import { Slot } from '../../src';

export interface Slot1Props {
  testData: string;
}

export class SlotDemo1 extends Slot<Slot.Mix, Slot1Props> {
  constructor(data: string) {
    super();
    this.use((ctx, next) => {
      ctx.testData = data;

      return next();
    });
  }
}
