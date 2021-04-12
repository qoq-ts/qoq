import Koa from 'koa';
import cookies from 'cookies';
import { WebRouter } from '../router/WebRouter';
import { WebRouterParser } from './WebRouterParser';

interface Options {
  /**
   * Default `./src/routers`
   */
  routersDir?: string | string[];
  /**
   * Trust proxy headers. Default `false`
   */
  proxy?: boolean;
  /**
   * Default `X-Forwarded-For`
   */
  proxyIpHeader?: string;
  /**
   * Environment. Default from process.env.NODE_ENV, then fallback to `development`
   */
  env?: string;
  /**
   * Max ips read from proxy ip header. Default `0` (means infinity)
   */
  maxIpsCount?: number;
  subdomainOffset?: number;
  /**
   * Signed cookie keys
   */
  cookie?: cookies.Option;
}

export class WebApplication extends Koa {
  protected readonly routerParser: WebRouterParser;

  constructor(options: Options = {}) {
    // @ts-expect-error why @types/koa doesn't accept arguments?
    super(options);
    this.routerParser = new WebRouterParser(options.routersDir ?? ['./src/routers']);
    this.middleware = [this.routerParser.compose];
  }

  /**
   * Mount router from instance
   */
  mountRouter(router: WebRouter | WebRouter[]): this {
    this.routerParser.mountRouter(router);
    return this;
  }

  /**
   * Mount router from path
   */
  async mountRouterPath(router: string | string[]): Promise<this> {
    this.routerParser.mountRouterPath(router);
    return this;
  }

  /**
   * @deprecated Middlewares are delegated to WebSlotManager.
   * @throws Error
   */
  use(_: never): Koa<any, any> {
    throw new Error('qoq.use() is denied to call.');
  }
}
