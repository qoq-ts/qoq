import { ConsoleSlotManager, WebSlotManager } from '../slot/SlotManager';

export class MakeTree {
  protected webTrunk: WebSlotManager<any, any> | null = null;
  protected consoleTrunk: ConsoleSlotManager<any, any> | null = null;

  public trunk(
    manager: WebSlotManager<any, any> | ConsoleSlotManager<any, any>,
  ): void {
    if (manager instanceof WebSlotManager) {
      this.webTrunk && MakeTree.throw('web');
      this.webTrunk = manager;
    } else if (manager instanceof ConsoleSlotManager) {
      this.consoleTrunk && MakeTree.throw('console');
      this.consoleTrunk = manager;
    } else {
      MakeTree.throw('unknown');
    }

    manager.setTrunk();
  }

  public /*protected*/ getWebTrunk(): WebSlotManager<any, any> {
    return this.webTrunk || new WebSlotManager();
  }

  public /*protected*/ getConsoleTrunk(): ConsoleSlotManager<any, any> {
    return this.consoleTrunk || new ConsoleSlotManager();
  }

  protected static throw(key: string) {
    throw new ReferenceError(`You have setting ${key} trunk already.`);
  }
}

// Too many properties shown in class.
export const Tree = new MakeTree();
