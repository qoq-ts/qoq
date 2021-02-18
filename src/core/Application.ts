import glob from 'glob';
import path from 'path';
import { EventEmitter } from 'events';
import { setInspector } from '../util/setInspector';
import { Composer, compose } from '../util/compose';
import { Router } from '../router/Router';
import { SlotManager } from '../slot/SlotManager';
import { toArray } from '../util/toArray';

export abstract class Application extends EventEmitter {
  protected readonly routerPath: string[];
  protected readonly compose: Composer;
  protected readonly treeBranch = compose([]);
  protected readonly treeTrunk = compose([]);
  private shouldTrunkRefresh: boolean = true;

  constructor(routerPath: string | string[]) {
    super();
    this.compose = compose([this.treeBranch, this.treeTrunk]);
    this.searchRouters(this.routerPath = toArray(routerPath));
    this.refreshTreeTrunk();
    setInspector(this);
  }

  public getPaths(): string[] {
    return this.routerPath;
  }

  protected searchRouters(routesPath: string[]): void {
    routesPath.forEach((routePath) => {
      glob.sync(path.resolve(routePath, '**/!(*.d).{ts,js}')).forEach((matchPath) => {
        const modules = require(matchPath);

        this.parseRouters(modules);
      });
    });
  }

  protected parseRouters(modules: Record<string, any>): void {
    const CustomRouter = this.getRouterInstance();
    const allModules = Object.values(modules);

    for (let i = 0; i < allModules.length; ++i) {
      const customModule = allModules[i];

      if (customModule && customModule instanceof CustomRouter) {
        const trunkNode = customModule.getSlotManager().getTrunkNode();
        const router = customModule.createMiddleware();

        if (trunkNode) {
          this.shouldTrunkRefresh = this.shouldTrunkRefresh || true;
          trunkNode.mountRouter(router);
        } else {
          this.treeBranch.append(router);
        }
      }
    }
  }

  protected refreshTreeTrunk(): void {
    if (this.shouldTrunkRefresh) {
      this.shouldTrunkRefresh = false;
      this.treeTrunk.set(this.getTrunkNode().getTrunkSlotsAndRouters());
    }
  }

  protected abstract getTrunkNode(): SlotManager<any, any, any>;
  protected abstract getRouterInstance(): new (...args: any[]) => Router<any, any>;

  protected abstract inspect(): object;
  protected abstract toJSON(): object;
}
