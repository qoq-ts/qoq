import { Slot } from '../../src';

export interface Slot1Props {
  testData4: string;
}

export class SlotDemo4 extends Slot<Slot.Console, Slot1Props> {
  constructor(data: string) {
    super();
    this.use((ctx, next) => {
      ctx.testData4 = data;

      return next();
    });
  }
}
