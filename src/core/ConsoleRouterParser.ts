import { ConsoleRouter } from '../router/ConsoleRouter';
import { HelpSlot } from '../slot/HelpSlot';
import { ConsoleSlotManager } from '../slot/SlotManager';
import { finder } from '../util/finder';
import { RouterParser } from './RouterParser';
import { Tree } from './Tree';

export class ConsoleRouterParser extends RouterParser<ConsoleRouter> {
  // It should initialize from super constructor
  protected helper!: HelpSlot;

  constructor(paths: finder.Paths) {
    super(paths);
    this.tree.unshift(...this.getHelper().collect());
  }

  protected getRouterInstance() {
    return ConsoleRouter;
  }

  protected getTrunkNode(): ConsoleSlotManager<any, any> {
    return Tree.getConsoleTrunk();
  }

  protected getHelper(): HelpSlot {
    return this.helper || (this.helper = new HelpSlot());
  }

  protected override parseRouters(modules: Record<string, any>): void {
    super.parseRouters(modules);
    Object.values(modules).forEach((item) => {
      if (item && item instanceof ConsoleRouter) {
        this.getHelper().appendBuilders(item.getBuilders());
      }
    });
  }
}
