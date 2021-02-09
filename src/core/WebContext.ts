import { IncomingMessage, ServerResponse } from 'http';
import util from 'util';
import statuses from 'statuses';
import createHttpError, { HttpError } from 'http-errors';
import { WebApplication, QoqError } from './WebApplication';
import { WebResponse, ResponseBody } from './WebResponse';
import { WebRequest } from './WebRequest';
import { Context } from './Context';
import Cookies from 'cookies';

export type WebCtx<Props = {}, State = {}> = WebContext<Props, State> & Props;

interface CookieApi {
  get(key: string, options?: Cookies.GetOption): string | undefined;
  set(key: string, value: string, options?: Cookies.SetOption): Cookies;
  delete(key: string, options?: Cookies.SetOption): Cookies;
};

export class WebContext<Props = {}, State = {}> extends Context<Props, State> {
  public readonly app: WebApplication;
  public readonly request: WebRequest;
  public readonly response: WebResponse;
  public/*protected*/ _params?: object;
  public/*protected*/ readonly req: IncomingMessage;
  public/*protected*/ readonly res: ServerResponse;
  protected _cookies?: CookieApi;

  constructor(app: WebApplication, request: WebRequest, response: WebResponse) {
    super();
    this.app = app;
    this.request = request;
    this.response = response;

    this.req = response.req = request.req;
    this.res = request.res = response.res;
    request.ctx = response.ctx = this;
  }

  public throw(statusCode: number, msg?: string | Error): HttpError;
  public throw(msg: string | Error): HttpError;
  public throw(...args: any[]): HttpError {
    throw createHttpError(...args);
  }

  public send(body: ResponseBody, statusCode?: number, contentType?: string): void {
    if (statusCode !== undefined) {
      this.response.statusCode = statusCode;
    }

    if (contentType !== undefined) {
      this.response.contentType = contentType;
    }

    this.response.body = body;
  }

  public get cookies(): CookieApi {
    return this._cookies || (this._cookies = (() => {
      const cookies = new Cookies(this.request.req, this.response.res, {
        secure: this.request.secure,
        ...this.app.options.cookie,
      });

      return <CookieApi>{
        get: (key, options) => {
          return cookies.get(key, options);
        },
        set: (key, value, options) => {
          return cookies.set(key, value, options);
        },
        delete: (key, options) => {
          return cookies.set(key, undefined, options);
        },
      };
    })());
  }

  public onerror(err: QoqError | null): void {
    if (err === null) {
      return;
    }

    // When dealing with cross-globals a normal `instanceof` check doesn't work properly.
    // See https://github.com/koajs/koa/issues/1466
    // We can probably remove it once jest fixes https://github.com/facebook/jest/issues/2549.
    const isNativeError = Object.prototype.toString.call(err) === '[object Error]' || err instanceof Error;
    if (!isNativeError) {
      err = new TypeError(util.format('non-error thrown: %j', err));
    }

    this.app.emit('error', err, this);

    const { response } = this;

    if (response.headersSent || !response.writable) {
      return;
    }

    response.res.getHeaderNames().forEach((name) => response.removeHeader(name));

    if ((err as HttpError).headers) {
      response.setHeaders((err as HttpError).headers!);
    }

    let statusCode: number;

    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      statusCode = 404;
    } else {
      statusCode = (err as HttpError).status || (err as HttpError).statusCode || 500;
    }

    let statusMessage = statuses.message[statusCode];

    if (!statusMessage || typeof statusCode !== 'number') {
      statusCode = 500;
    }

    response.body = (err as HttpError).expose ? err.message : statusMessage || '';
    response.statusCode = statusCode;

    this.app.emit('errorRespond', err, this);

    this.app.respond(this);
  };

  public/*protected*/ inspect() {
    return this.toJSON();
  }

  public/*protected*/ toJSON() {
    return {
      request: this.request.toJSON(),
      response: this.response.toJSON(),
      app: this.app.toJSON(),
      originalUrl: this.request.url,
      req: '<original node req>',
      res: '<original node res>',
      socket: '<original node socket>',
    };
  }
}
