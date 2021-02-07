import glob from 'glob';
import path from 'path';
import { EventEmitter } from 'events';
import { setInspector } from '../util/setInspector';
import { Composer, compose } from '../util/compose';
import { Router } from '../router/Router';
import { GlobalComposer } from '../util/GlobalComposer';

export abstract class Application extends EventEmitter {
  protected readonly routesPath: string[];
  protected readonly composer: Composer = compose([]);
  protected readonly routersBeforeGlobal = compose([]);
  protected readonly globalAndLocalSlots = new GlobalComposer();

  constructor(routesPath: string | string[]) {
    super();

    this.composer.append(this.routersBeforeGlobal);
    this.composer.append(this.globalAndLocalSlots.getGlobal());
    this.searchRouters(
      this.routesPath = Array.isArray(routesPath) ? routesPath : [routesPath]
    );
    setInspector(this);
  }

  public getPaths(): string[] {
    return this.routesPath;
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
        const globalSlots = customModule.getGlobalSlotManager().getSlots();

        if (globalSlots.length) {
          const toLocalComposer = this.globalAndLocalSlots.compare(globalSlots);
          this.composer.append(customModule.createMiddleware(toLocalComposer));
        } else {
          this.routersBeforeGlobal.append(customModule.createMiddleware());
        }
      }
    }
  }

  protected abstract getRouterInstance(): new (...args: any[]) => Router<any, any>;

  protected abstract inspect(): object;
  protected abstract toJSON(): object;
}
