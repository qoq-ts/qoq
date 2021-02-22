import glob from 'glob';
import path from 'path';
import { EventEmitter } from 'events';
import { setInspector } from '../util/setInspector';
import { Composer, compose } from '../util/compose';
import { Router } from '../router/Router';
import { SlotManager } from '../slot/SlotManager';
import { toArray } from '../util/toArray';

export abstract class Application<R extends Router<any, any>> extends EventEmitter {
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

  /**
   * Mount router from path or instance
   */
  public mountRouter(router: R | R[] | string | string[]): this {
    const routers = toArray(router) as string[] | R[];

    if (!routers.length) {
      return this;
    }

    const isString = (data: string[] | R[]): data is string[] => {
      return typeof data[0] === 'string';
    };

    if (isString(routers)) {
      this.routerPath.push(...routers);
      this.searchRouters(routers);
    } else {
      this.parseRouters(routers);
    }

    this.refreshTreeTrunk();

    return this;
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
  protected abstract getRouterInstance(): new (...args: any[]) => R;

  protected abstract inspect(): object;
  protected abstract toJSON(): object;
}
