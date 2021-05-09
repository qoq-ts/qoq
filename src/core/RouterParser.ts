import { Router } from '../router/Router';
import { SlotManager } from '../slot/SlotManager';
import compose, { Middleware, ComposedMiddleware } from 'koa-compose';
import { toArray } from '../util/toArray';
import { Topic } from 'topic';
import { finder } from '../util/finder';

export abstract class RouterParser<R extends Router<any, any>> {
  public readonly compose: ComposedMiddleware<any>;
  public readonly pathPattern: finder.Options[];

  protected loadingCounter: number = 1;
  protected topic = new Topic<{ ready: () => void }>();
  protected treeTrunk: Middleware<any>[] = [];
  protected readonly tree: Middleware<any>[];
  protected readonly treeBranch: Middleware<any>[] = [];

  private shouldTrunkRefresh: boolean = true;

  constructor(pattern: finder.Paths) {
    this.topic.keep('ready', () => this.loadingCounter === 0);
    this.pathPattern = finder.normalize(pattern);
    this.tree = [compose(this.treeBranch), compose(this.treeTrunk)];
    this.compose = compose(this.tree);
    this.searchRouters(this.pathPattern).then(() => {
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
  public async mountRouterPath(path: finder.Paths): Promise<void> {
    const pattern = finder.normalize(path);

    if (pattern.length) {
      this.loadingCounter += 1;
      this.pathPattern.push(...pattern);
      await this.searchRouters(pattern);
      this.onReady();
    }
  }

  protected async searchRouters(pattern: finder.Options[]): Promise<void> {
    const matches = await finder(pattern);

    await Promise.all(
      matches.map((file) => {
        return import(file).then((modules) => {
          this.parseRouters(modules);
        });
      })
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
    this.loadingCounter -= 1;
    if (this.loadingCounter === 0) {
      this.topic.publish('ready');
    }
  }

  protected abstract getTrunkNode(): SlotManager<any, any, any>;
  protected abstract getRouterInstance(): new (...args: any[]) => R;
}
