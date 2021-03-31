import glob from 'glob';
import path from 'path';
import { Router } from '../router/Router';
import { SlotManager } from '../slot/SlotManager';
import compose, { Middleware, ComposedMiddleware } from 'koa-compose';
import { toArray } from '../util/toArray';

export abstract class RouterParser<R extends Router<any, any>> {
  public readonly compose: ComposedMiddleware<any>;
  public readonly paths: string[];

  protected treeTrunk: Middleware<any>[] = [];
  protected readonly tree: Middleware<any>[];
  protected readonly treeBranch: Middleware<any>[] = [];

  private shouldTrunkRefresh: boolean = true;

  constructor(paths: string | string[]) {
    this.paths = toArray(paths);
    this.searchRouters(this.paths);
    this.refreshTreeTrunk();
    this.tree = [compose(this.treeBranch), compose(this.treeTrunk)];
    this.compose = compose(this.tree);
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
      this.paths.push(...routers);
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
          this.treeBranch.push(router);
        }
      }
    }
  }

  protected refreshTreeTrunk(): void {
    if (this.shouldTrunkRefresh) {
      this.shouldTrunkRefresh = false;
      if (this.tree) {
        this.treeTrunk.splice(0, this.treeTrunk.length,
          ...this.getTrunkNode().getTrunkMiddlewareAndRouters(),
        );
      } else {
        this.treeTrunk = this.getTrunkNode().getTrunkMiddlewareAndRouters();
      }
    }
  }

  protected abstract getTrunkNode(): SlotManager<any, any, any>;
  protected abstract getRouterInstance(): new (...args: any[]) => R;
}
