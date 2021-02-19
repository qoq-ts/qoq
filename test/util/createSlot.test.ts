import { compose, WebSlotManager } from '../../src';
import { createSlot } from '../../src/util/createSlot';

it ('can create simple slot', async () => {
  const ids: number[] = [];
  const slots = WebSlotManager
    .use(createSlot('web', async (_, next) => {
      ids.push(1);
      await next();
      ids.push(3);
    }))
    .use(createSlot('console', (_, next) => {
      ids.push(2);
      return next();
    }));

  await compose(slots.getBranchSlots())({});
  expect(ids.join(',')).toBe('1,2,3');
});
