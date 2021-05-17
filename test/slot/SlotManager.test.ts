import { WebRouter, WebSlotManager } from '../../src';
import { SlotDemo1 } from '../fixture/SlotDemo1';
import { SlotDemo2 } from '../fixture/SlotDemo2';
import { SlotDemo3 } from '../fixture/SlotDemo3';
import { SlotDemo4 } from '../fixture/SlotDemo4';

describe('Slot manager', () => {
  it('can collect branch slots', () => {
    const slots = WebSlotManager.use(new SlotDemo1('a')).use(
      new SlotDemo2('b'),
    );

    expect(slots.getBranchMiddleware()).toHaveLength(2);
    expect(slots.getTrunkNode()).toBeNull();
  });

  it('can collect trunk slots', () => {
    const slots = WebSlotManager.use(new SlotDemo1('a')).use(
      new SlotDemo2('b'),
    );

    slots.setTrunk();

    expect(slots.getBranchMiddleware()).toHaveLength(0);
    expect(slots.getTrunkNode()).toEqual(slots);
    expect(slots.getTrunkMiddlewareAndRouters()).toHaveLength(2);
  });

  it('trunk and branch can write together', () => {
    const slots = WebSlotManager.use(new SlotDemo1('a')).use(
      new SlotDemo2('b'),
    );
    slots.setTrunk();

    const nextSlots = slots
      .use(new SlotDemo3('c'))
      // @ts-expect-error
      .use(new SlotDemo4('d'));

    expect(nextSlots.getBranchMiddleware()).toHaveLength(2);

    expect(nextSlots.getTrunkNode()).toEqual(slots);
    expect(nextSlots.getTrunkMiddlewareAndRouters()).toHaveLength(2);
  });

  it('can mount router', () => {
    const slots = new WebSlotManager();
    slots.setTrunk();

    const router = new WebRouter({
      slots: slots.use(new SlotDemo1('a')),
    }).createMiddleware();

    slots.mountRouter(router);

    expect(slots.getTrunkMiddlewareAndRouters()).toHaveLength(1);
    expect(slots.getTrunkMiddlewareAndRouters()[0]).toEqual(router);
  });

  it('only tree trunk can mount router', () => {
    const slots = new WebSlotManager();
    const router = new WebRouter({
      slots: slots.use(new SlotDemo1('a')),
    }).createMiddleware();

    expect(() => slots.mountRouter(router)).toThrowError();
  });

  it('can use slot manager in use()', () => {
    const demo = new SlotDemo1('a');
    const slots = WebSlotManager.use(
      WebSlotManager.use(WebSlotManager.use(demo)),
    );

    expect(slots.getBranchMiddleware()[0]).toEqual(demo.collect()[0]);
  });

  it('can set null to skip slot', () => {
    const slots = WebSlotManager.use(new SlotDemo1('a'));
    const slots2 = slots.use(null).use(null);

    expect(slots2).toEqual(slots);
  });

  it('can use function in use()', () => {
    const slots = WebSlotManager.use(async (ctx, next) => {
      ctx.request;
      await next();
    }).use((ctx, next) => {
      ctx.response;
      return next();
    });

    expect(slots.getBranchMiddleware()).toHaveLength(2);
  });
});
