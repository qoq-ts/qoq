import { ConsoleRouter, ConsoleSlotManager, Tree } from '../../src';

const slots = ConsoleSlotManager.use((ctx, next) => {
  // @ts-expect-error
  ctx.state.data = 'router3';
  return next();
});

Tree.setConsoleTrunk(slots);

export const router = new ConsoleRouter({
  slots: slots,
});

router.command('/test3').action<{}, { data :string }>((ctx) => {
  ctx.state.data = 'Hello ' + ctx.state.data;
});
