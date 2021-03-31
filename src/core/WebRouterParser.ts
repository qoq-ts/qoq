import { WebRouter } from '../router/WebRouter';
import { WebSlotManager } from '../slot/SlotManager';
import { RouterParser } from './RouterParser';
import { Tree } from './Tree';

export class WebRouterParser extends RouterParser<WebRouter> {
  protected getRouterInstance() {
    return WebRouter;
  }

  protected getTrunkNode(): WebSlotManager<any, any> {
    return Tree.getWebTrunk();
  }
}
