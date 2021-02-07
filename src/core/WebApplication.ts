import './koa';
import { EOL } from 'os';
import { HttpError } from 'http-errors';
import http, { Server, IncomingMessage, ServerResponse } from 'http';
import { ListenOptions } from 'net';
import util from 'util';
import chalk from 'chalk';
import onFinished from 'on-finished';
import statuses from 'statuses';
import { WebRequest } from './WebRequest';
import { WebResponse } from './WebResponse';
import { WebContext } from './WebContext';
import { Stream } from 'stream';
import { Application } from './Application';
import { Method } from '../util/Method';
import { WebRouter } from '../router/WebRouter';
import cookies from 'cookies';
import { toArray } from '../util/toArray';

interface Options {
  routerDir?: string | string[];
  // Trust proxy headers
  proxy?: boolean;
  proxyIpHeader?: string;
  env?: string;
  // Max ips read from proxy ip header, default to 0 (means infinity)
  maxIpsCount?: number;
  subdomainOffset?: number;
  cookie?: cookies.Option;
}

export type QoqError = Error | HttpError | NodeJS.ErrnoException;

export class WebApplication extends Application {
  public/*protected*/ readonly options: Required<Options>;

  constructor(options: Options = {}) {
    const dir = options.routerDir || './src/routes';
    super(dir);

    this.options = {
      proxy: options.proxy || false,
      proxyIpHeader: options.proxyIpHeader || 'X-Forwarded-For',
      subdomainOffset: options.subdomainOffset || 2,
      maxIpsCount: options.maxIpsCount || 0,
      env: options.env && process.env.NODE_ENV || 'development',
      routerDir: dir,
      cookie: {},
    };
  }

  public listen(port?: number, hostname?: string, backlog?: number, listeningListener?: () => void): Server;
  public listen(port?: number, hostname?: string, listeningListener?: () => void): Server;
  public listen(port?: number, backlog?: number, listeningListener?: () => void): Server;
  public listen(port?: number, listeningListener?: () => void): Server;
  public listen(path: string, backlog?: number, listeningListener?: () => void): Server;
  public listen(path: string, listeningListener?: () => void): Server;
  public listen(options: ListenOptions, listeningListener?: () => void): Server;
  public listen(handle: any, backlog?: number, listeningListener?: () => void): Server;
  public listen(handle: any, listeningListener?: () => void): Server;
  public listen(...args: any[]): Server {
    const server = http.createServer(this.serverCallback());
    return server.listen(...args);
  }

  public on(event: 'error' | 'errorRespond', listener: (err: QoqError, ctx: WebContext) => void): this;
  public on(event: string | symbol, listener: (...args: any[]) => void): this;
  public on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  public once(event: 'error' | 'errorRespond', listener: (err: QoqError, ctx: WebContext) => void): this;
  public once(event: string | symbol, listener: (...args: any[]) => void): this;
  public once(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.once(event, listener);
  }

  /**
   * Useful for testing scenario.
   */
  public appendRoutes(routers: WebRouter | WebRouter[]): this {
    toArray(routers).forEach((router) => {
      this.parseRouters({ default: router });
    });

    return this;
  }

  protected getRouterInstance(): new (...args: any[]) => WebRouter {
    return WebRouter;
  }

  protected serverCallback() {
    if (!this.listenerCount('error')) {
      this.on('error', this.onerror);
    }

    return (req: IncomingMessage, res: ServerResponse) => {
      this.handleRequest(this.createContext(req, res));
    };
  }

  public onerror(err: QoqError) {
    // When dealing with cross-globals a normal `instanceof` check doesn't work properly.
    // See https://github.com/koajs/koa/issues/1466
    // We can probably remove it once jest fixes https://github.com/facebook/jest/issues/2549.
    const isNativeError = Object.prototype.toString.call(err) === '[object Error]' || err instanceof Error;
    if (!isNativeError) {
      err = new TypeError(util.format('non-error thrown: %j', err));
    }

    if ((err as HttpError).status === 404 || (err as HttpError).expose) {
      return;
    }

    const msgs = (err.stack || err.toString())
      .split(EOL)
      .map((item) => '  ' + item);

    console.error();
    console.error(chalk.red(msgs.shift()));
    console.error(msgs.join(EOL));
    console.error();
  }

  protected createRequest(req: IncomingMessage): WebRequest {
    return new WebRequest(this, req);
  }

  protected createResponse(res: ServerResponse): WebResponse {
    return new WebResponse(this, res);
  }

  protected createContext(req: IncomingMessage, res: ServerResponse) {
    return new WebContext(this, this.createRequest(req), this.createResponse(res));
  }

  protected handleRequest(ctx: WebContext): void {
    const onError = (err: QoqError | null) => ctx.onerror(err);

    ctx.response.res.statusCode = 404;
    onFinished(ctx.response.res, onError);
    this.composer(ctx)
      .then(() => this.respond(ctx))
      .catch(onError);
  }

  public/*protected*/ inspect() {
    return this.toJSON();
  }

  public/*protected*/ toJSON() {
    return {
      subdomainOffset: this.options.subdomainOffset,
      proxy: this.options.proxy,
      env: this.options.env,
    };
  }

  public/*protected*/ respond(ctx: WebContext): any {
    const { response, request } = ctx;

    if (!response.writable) {
      return;
    }

    const { res, statusCode } = response;
    let { body } = response;

    if (statuses.empty[statusCode]) {
      // Reset headers
      response.body = null;
      return res.end();
    }

    if (request.method === Method.head) {
      if (!response.headersSent && !response.hasHeader('Content-Length')) {
        const contentLength = response.contentLength;

        // Stream returns -1
        if (contentLength >= 0) {
          response.contentLength = contentLength;
        }
      }

      return res.end();
    }

    if (body === null) {
      if (response.explicitNullBody) {
        return res.end();
      }

      if (request.req.httpVersionMajor >= 2) {
        body = String(statusCode);
      } else {
        body = response.statusMessage || String(statusCode);
      }

      response.contentType = 'text';
      response.contentLength = Buffer.byteLength(body);

      return res.end(body);
    }

    if (Buffer.isBuffer(body)) {
      return res.end(body);
    }

    if (typeof body === 'string') {
      return res.end(body);
    }

    if (body instanceof Stream) {
      return body.pipe(res);
    }

    body = JSON.stringify(body);
    response.contentType = 'json';
    response.contentLength = Buffer.byteLength(body);
    return res.end(body);
  }
}
