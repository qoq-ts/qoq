import { Slot, testMiddleware } from '../../src';
import { SlotDemo1 } from '../fixture/SlotDemo1';
import { SlotDemo2 } from '../fixture/SlotDemo2';

it('can run custom slot', async () => {
  const random = Math.random().toString();
  const ctx = await testMiddleware(new SlotDemo1(random))({});

  expect(ctx.testData).toBe(random);
});

it('can assume other slots have been registered', async () => {
  class Custom extends Slot<Slot.Web, { hello: string }> {
    constructor() {
      super();
      this.assume(SlotDemo2).use((ctx, next) => {
        ctx.hello = ctx.testData2.toUpperCase();

        return next();
      });
    }
  }

  try {
    await testMiddleware(new Custom())({});
    expect(true).toBe(false);
  } catch {
    expect(true).toBe(true);
  }

  const ctx = await testMiddleware(new SlotDemo2('abc'), new Custom())({});

  expect(ctx.hello).toBe('ABC');
});
