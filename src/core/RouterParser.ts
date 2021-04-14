import glob from 'glob';
import path from 'path';
import { Router } from '../router/Router';
import { SlotManager } from '../slot/SlotManager';
import compose, { Middleware, ComposedMiddleware } from 'koa-compose';
import { toArray } from '../util/toArray';
import { Topic } from 'topic';

export abstract class RouterParser<R extends Router<any, any>> {
  public readonly compose: ComposedMiddleware<any>;
  public readonly paths: string[];

  protected ready: boolean = false;
  protected topic = new Topic<{ ready: () => void }>();
  protected treeTrunk: Middleware<any>[] = [];
  protected readonly tree: Middleware<any>[];
  protected readonly treeBranch: Middleware<any>[] = [];

  private shouldTrunkRefresh: boolean = true;

  constructor(paths: string | string[]) {
    this.topic.keep('ready', () => this.ready === true);
    this.paths = toArray(paths);
    this.tree = [compose(this.treeBranch), compose(this.treeTrunk)];
    this.compose = compose(this.tree);
    this.searchRouters(this.paths).then(() => {
      this.onReady();
    });
  }

  public waitToReady() {
    return new Promise((resolve) => {
      this.topic.subscribeOnce('ready', () => {
        resolve(undefined);
      });
    });
  }

  /**
   * Mount router from instance
   */
  public mountRouter(router: R | R[]): void {
    const routers = toArray(router) as string[] | R[];

    if (routers.length) {
      this.parseRouters(routers);
      this.refreshTreeTrunk();
    }
  }

  /**
   * Mount router from path
   */
  public async mountRouterPath(path: string | string[]): Promise<void> {
    const paths = toArray(path);

    if (paths.length) {
      this.ready = false;
      this.paths.push(...paths);
      await this.searchRouters(paths);
      this.onReady();
    }
  }

  protected async searchRouters(routesPath: string[]): Promise<void> {
    await Promise.all(
      routesPath.map((routePath) => {
        return Promise.all(
          glob.sync(path.resolve(routePath, '**/!(*.d).{ts,js}')).map((file) => {
            return import(file).then((modules) => {
              this.parseRouters(modules);
            });
          }),
        );
      }),
    );

    this.refreshTreeTrunk();
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
      this.treeTrunk.splice(0, this.treeTrunk.length,
        ...this.getTrunkNode().getTrunkMiddlewareAndRouters(),
      );
    }
  }

  protected onReady() {
    this.topic.publish('ready');
    this.ready = true;
  }

  protected abstract getTrunkNode(): SlotManager<any, any, any>;
  protected abstract getRouterInstance(): new (...args: any[]) => R;
}
