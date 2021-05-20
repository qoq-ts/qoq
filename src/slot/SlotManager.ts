import { Middleware } from 'koa-compose';
import { Slot, SlotAllType, SlotCtx } from './Slot';

export type Use<T extends SlotAllType, P, S> =
  | Slot<T, P, S>
  | SlotManager<T, P, S>
  | SlotCtx<Slot.Web extends T ? Slot.Web : Slot.Console extends T ? Slot.Console : Slot.Mix, P, S>
  | null;

export class SlotManager<T extends SlotAllType, Props = {}, State = {}> {
  protected middleware: Middleware<any>[] = [];
  protected routers: Array<SlotCtx<T>> = [];
  protected prev: SlotManager<T, any, any> | null = null;
  protected isTrunk: boolean = false;

  public static use<T extends SlotAllType, P = {}, S = {}>(
    this: new (...args: any[]) => SlotManager<T, any, any>,
    slot: Use<T, P, S>,
  ): SlotManager<T, P, S> {
    return new this([]).use(slot);
  }

  constructor(sources: (Slot<T, any, any> | Middleware<any>)[] = []) {
    this.middleware = [];

    for (let i = 0; i < sources.length; ++i) {
      const item = sources[i]!;

      if (typeof item === 'function') {
        this.middleware.push(item);
      } else {
        this.middleware = this.middleware.concat(item.collect());
      }
    }
  }

  use<P, S>(slot: Use<T, P, S>): SlotManager<T, Props & P, State & S> {
    if (slot === null) {
      return this;
    }

    const Target = this.constructor as typeof SlotManager;

    if (slot instanceof SlotManager) {
      let manager: SlotManager<T, any, any> = this;
      let managers: SlotManager<T, any, any>[] = [];
      let prev: SlotManager<T, any, any> | null = slot;

      while (prev) {
        managers.push(prev);
        prev = prev.prev;
      }

      for (let i = managers.length - 1; i >= 0; --i) {
        const node = managers[i]!;
        const target: SlotManager<T, any, any> = new Target(node.middleware);
        target.prev = manager;
        target.routers = node.routers;
        manager = target;
      }

      return manager;
    }

    const manager = new Target([slot]);
    manager.prev = this;

    return manager;
  }

  public /*protected*/ getTrunkMiddlewareAndRouters() {
    let mixData: Middleware<any>[] = [];
    let prevManager: SlotManager<T, any, any> | null = this;

    while (prevManager) {
      if (prevManager.isTrunk) {
        mixData = prevManager.middleware.concat(prevManager.routers, mixData);
      }
      prevManager = prevManager.prev;
    }

    return mixData;
  }

  public /*protected*/ getTrunkNode(): SlotManager<T, any, any> | null {
    let prevManager: SlotManager<T, any, any> | null = this;

    while (prevManager) {
      if (prevManager.isTrunk) {
        return prevManager;
      }
      prevManager = prevManager.prev;
    }

    return null;
  }

  public /*protected*/ getBranchMiddleware() {
    let middleware: Middleware<any>[] = [];
    let prevManager: SlotManager<T, any, any> | null = this;

    while (prevManager && !prevManager.isTrunk) {
      middleware = prevManager.middleware.concat(middleware);
      prevManager = prevManager.prev;
    }

    return middleware;
  }

  public /*protected*/ setTrunk(): void {
    let prevManager: SlotManager<T, any, any> | null = this;

    do {
      prevManager.isTrunk = true;
    } while ((prevManager = prevManager.prev));
  }

  public /*protected*/ mountRouter(router: SlotCtx<T>) {
    if (!this.isTrunk) {
      throw new ReferenceError('Only tree trunk can mount router');
    }
    this.routers.push(router);
  }
}

export class WebSlotManager<Props = {}, State = {}> extends SlotManager<
  Slot.Mix | Slot.Web,
  Props,
  State
> {}

export class ConsoleSlotManager<Props = {}, State = {}> extends SlotManager<
  Slot.Mix | Slot.Console,
  Props,
  State
> {}
