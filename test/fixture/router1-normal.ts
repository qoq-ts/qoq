import { WebRouter, WebSlotManager } from '../../src';

export const router = new WebRouter({
  slots: new WebSlotManager(),
});

router.get('/test1').action((ctx) => {
  ctx.body = 'Hello router1';
});
