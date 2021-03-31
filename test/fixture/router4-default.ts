import { WebRouter, WebSlotManager } from '../../src';

const router = new WebRouter({
  slots: new WebSlotManager(),
});

router.get('/test4').action((ctx) => {
  ctx.body = 'Hello router4';
});

export default router;
