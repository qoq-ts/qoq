import { ConsoleRouter, ConsoleSlotManager, Tree } from '../../src';

const slots = ConsoleSlotManager.use((ctx, next) => {
  ctx.state.data = 'router3';
  return next();
});

Tree.trunk(slots);

export const router = new ConsoleRouter({
  slots: slots,
});

router
  .command('/test3')
  .showInHelp()
  .action<{}, { data: string }>((ctx) => {
    ctx.state.data = 'Hello ' + ctx.state.data;
  });
