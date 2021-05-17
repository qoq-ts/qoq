import { Tree, WebRouter, WebSlotManager } from '../../src';

const slots = WebSlotManager.use((ctx, next) => {
  // @ts-expect-error
  ctx.state.data = 'router2';
  return next();
});

Tree.trunk(slots);

export const router = new WebRouter({
  slots: slots,
});

router.get('/test2').action<{}, { data: string }>((ctx) => {
  ctx.body = 'Hello ' + ctx.state.data;
});
