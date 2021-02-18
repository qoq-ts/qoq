import { expect } from 'chai';
import { WebRouter, WebSlotManager } from '../../src';
import { SlotDemo1 } from '../fixture/SlotDemo1';
import { SlotDemo2 } from '../fixture/SlotDemo2';
import { SlotDemo3 } from '../fixture/SlotDemo3';
import { SlotDemo4 } from '../fixture/SlotDemo4';

describe('Slot manager', () => {
  it ('can collect branch slots', () => {
    const slots = WebSlotManager
      .use(new SlotDemo1('a'))
      .use(new SlotDemo2('b'));

    expect(slots.getBranchSlots()).to.have.length(2);
    expect(slots.getTrunkNode()).to.be.null;
    expect(slots.getBranchSlots()[0]).to.instanceOf(SlotDemo1);
    expect(slots.getBranchSlots()[1]).to.instanceOf(SlotDemo2);
  });

  it ('can collect trunk slots', () => {
    const slots = WebSlotManager
      .use(new SlotDemo1('a'))
      .use(new SlotDemo2('b'));

    slots.setTrunk();

    expect(slots.getBranchSlots()).to.have.length(0);
    expect(slots.getTrunkNode()).to.equal(slots);
    expect(slots.getTrunkSlotsAndRouters()).to.have.length(2);
    expect(slots.getTrunkSlotsAndRouters()[0]).to.instanceOf(SlotDemo1);
    expect(slots.getTrunkSlotsAndRouters()[1]).to.instanceOf(SlotDemo2);
  });

  it ('trunk and branch can write together', () => {
    const slots = WebSlotManager
      .use(new SlotDemo1('a'))
      .use(new SlotDemo2('b'));
    slots.setTrunk();

    const nextSlots = slots
      .use(new SlotDemo3('c'))
      // @ts-expect-error
      .use(new SlotDemo4('d'));

    expect(nextSlots.getBranchSlots()).to.have.length(2);
    expect(nextSlots.getBranchSlots()[0]).to.instanceOf(SlotDemo3);
    expect(nextSlots.getBranchSlots()[1]).to.instanceOf(SlotDemo4);

    expect(nextSlots.getTrunkNode()).to.equal(slots);
    expect(nextSlots.getTrunkSlotsAndRouters()).to.have.length(2);
    expect(nextSlots.getTrunkSlotsAndRouters()[0]).to.instanceOf(SlotDemo1);
    expect(nextSlots.getTrunkSlotsAndRouters()[1]).to.instanceOf(SlotDemo2);
  });

  it ('can mount router', () => {
    const slots = new WebSlotManager();
    slots.setTrunk();

    const router = new WebRouter({
      slots: slots.use(new SlotDemo1('a')),
    }).createMiddleware();

    slots.mountRouter(router);

    expect(slots.getTrunkSlotsAndRouters()).to.have.length(1);
    expect(slots.getTrunkSlotsAndRouters()[0]).to.equal(router);
  });

  it ('only tree trunk can mount router', () => {
    const slots = new WebSlotManager();
    const router = new WebRouter({
      slots: slots.use(new SlotDemo1('a')),
    }).createMiddleware();

    expect(() => slots.mountRouter(router)).to.throw(Error);
  });

  it ('can use slot manager in use()', () => {
    const slots = WebSlotManager.use(WebSlotManager.use(WebSlotManager.use(new SlotDemo1('a'))));

    expect(slots.getBranchSlots()[0]).to.instanceOf(SlotDemo1);
  });
});
