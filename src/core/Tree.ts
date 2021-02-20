import { ConsoleSlotManager, WebSlotManager } from '../slot/SlotManager';

export class Tree {
  protected static webTrunk: WebSlotManager<any, any> | null = null;
  protected static consoleTrunk: ConsoleSlotManager<any, any> | null = null;

  public static setWebTrunk(manager: WebSlotManager<any, any>): void {
    Tree.webTrunk && Tree.throw('web');
    Tree.webTrunk = manager;
    manager.setTrunk();
  }

  public static setConsoleTrunk(manager: ConsoleSlotManager<any, any>): void {
    Tree.consoleTrunk && Tree.throw('console');
    Tree.consoleTrunk = manager;
  }

  public/*protected*/ static getWebTrunk(): WebSlotManager<any, any> {
    return Tree.webTrunk || new WebSlotManager();
  }

  public/*protected*/ static getConsoleTrunk(): ConsoleSlotManager<any, any> {
    return Tree.consoleTrunk || new ConsoleSlotManager();
  }

  protected static throw(key: string) {
    throw new ReferenceError(`You have setting ${key} trunk already, do not set again`);
  }
}
