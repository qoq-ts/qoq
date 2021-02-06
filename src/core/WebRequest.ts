import { IncomingMessage, IncomingHttpHeaders, ServerResponse } from 'http';
import net from 'net';
import parseUrl from 'parseurl';
import contentType from 'content-type';
import typeIs from 'type-is';
import accepts, { Accepts } from 'accepts';
import fresh from 'fresh';
import { format as formatUrl, URL } from 'url';
import querystring from 'querystring';
import { WebApplication } from './WebApplication';
import { WebContext } from './WebContext';
import { Method } from '../util/Method';
import { setInspector } from '../util/setInspector';

export class WebRequest {
  public readonly req: IncomingMessage;
  public/*protected*/ readonly app: WebApplication;
  public/*protected*/ ctx?: WebContext;
  public/*protected*/ res?: ServerResponse;
  public/*protected*/ rawParams: Record<string, string> = {};
  protected _accept?: Accepts;
  protected memoizedURL?: URL;
  protected IP?: string;

  constructor(app: WebApplication, req: IncomingMessage) {
    this.app = app;
    this.req = req;

    setInspector(this);
  }

  public get headers(): IncomingHttpHeaders {
    return this.req.headers;
  }

  public set headers(values: IncomingHttpHeaders) {
    this.req.headers = values;
  }

  get url(): string {
    return this.req.url || '';
  }

  set url(val: string) {
    this.req.url = val;
  }

  public get origin(): string {
    return `${this.protocol}://${this.host}`;
  }

  public get href(): string {
    const url = this.req.url || '';

    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    return this.origin + url;
  }

  public get method(): Method {
    return (this.req.method || Method.get) as Method;
  }

  public set method(val: Method) {
    this.req.method = val;
  }

  public get path(): string {
    return parseUrl(this.req)?.pathname || '';
  }

  public set path(path: string) {
    const url = parseUrl(this.req);
    if (!url || url.pathname === path) {
      return;
    }

    url.pathname = path;
    url.path = null;

    this.url = formatUrl(url);
  }

  public get querystring(): string {
    const query = parseUrl(this.req)?.query;

    if (query !== null && typeof query === 'object') {
      return querystring.stringify(query);
    }

    return query || '';
  }

  public set querystring(str: string) {
    const url = parseUrl(this.req);

    if (!url || url.search === `?${str}`) {
      return;
    }

    url.search = str;
    url.path = null;

    this.url = formatUrl(url);
  }

  get search(): string {
    if (!this.querystring) {
      return '';
    }

    return `?${this.querystring}`;
  }

  set search(str: string) {
    this.querystring = str;
  }

  public get host(): string {
    let host = this.app.options.proxy && this.getHeader('X-Forwarded-Host');

    if (!host) {
      if (this.req.httpVersionMajor >= 2) {
        host = this.getHeader(':authority');
      }

      if (!host) {
        host = this.getHeader('Host');
      }
    }

    if (!host || typeof host !== 'string') {
      return '';
    }

    return host.split(/\s*,\s*/, 1)[0] || '';
  }

  get hostname(): string {
    const host = this.host;
    if (!host) {
      return '';
    }

    if ('[' === host[0]) {
      return this.URL.hostname || ''; // IPv6
    }

    return host.split(':', 1)[0] || '';
  }

  get URL(): URL {
    if (!this.memoizedURL) {
      const originalUrl = this.url;

      try {
        this.memoizedURL = new URL(`${this.origin}${originalUrl}`);
      } catch (err) {
        this.memoizedURL = Object.create(null);
      }
    }

    return this.memoizedURL!;
  }

  get fresh(): boolean {
    const method = this.method;
    const statusCode = this.ctx!.response.statusCode;

    // GET or HEAD for weak freshness validation only
    if (Method.get !== method && Method.head !== method) {
      return false;
    }

    // 2xx or 304 as per rfc2616 14.26
    if ((statusCode >= 200 && statusCode < 300) || 304 === statusCode) {
      return fresh(this.headers, this.ctx!.response.getHeaders());
    }

    return false;
  }

  get stale(): boolean {
    return !this.fresh;
  }

  get idempotent(): boolean {
    const methods = ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE'];
    return !!~methods.indexOf(this.method);
  }

  public get socket(): net.Socket {
    return this.req.socket;
  }

  get charset(): string {
    try {
      const { parameters } = contentType.parse(this.req);
      return parameters.charset || '';
    } catch (e) {
      return '';
    }
  }

  get contentLength(): number {
    const len = this.getHeader('Content-Length');
    if (len === '') {
      return 0;
    }
    return ~~len;
  }

  public get protocol(): string {
    // @ts-expect-error
    if (this.req.socket.encrypted) {
      return 'https';
    }

    if (!this.app.options.proxy) {
      return 'http';
    }

    const proto = this.getHeader('X-Forwarded-Proto');
    return typeof proto === 'string' && proto.split(/\s*,\s*/, 1)[0] || 'http';
  }


  public get secure(): boolean {
    return this.protocol === 'https';
  }

  public get ips(): string[] {
    const { proxy, maxIpsCount, proxyIpHeader } = this.app.options;
    const val = this.getHeader(proxyIpHeader) as string;
    let ips = proxy && val ? val.split(/\s*,\s*/) : [];

    if (maxIpsCount > 0) {
      ips = ips.slice(-maxIpsCount);
    }

    return ips;
  }

  get ip(): string {
    if (!this.IP) {
      this.IP = this.ips[0] || this.socket.remoteAddress || '';
    }
    return this.IP!;
  }

  set ip(ip: string) {
    this.IP = ip;
  }

  get subdomains(): string[] {
    const offset = this.app.options.subdomainOffset;
    const hostname = this.hostname;

    if (net.isIP(hostname)) {
      return [];
    }

    return hostname
      .split('.')
      .reverse()
      .slice(offset);
  }

  get accept() {
    if (!this._accept) {
      this._accept = accepts(this.req);
    }

    return this._accept;
  }

  set accept(obj: Accepts) {
    this._accept = obj;
  }

  accepts(...args: string[]) {
    return this.accept.types(...args);
  }

  acceptsEncodings(...args: string[]) {
    return this.accept.encodings(...args);
  }

  acceptsCharsets(...args: string[]) {
    return this.accept.charsets(...args);
  }

  acceptsLanguages(...args: string[]) {
    return this.accept.languages(...args);
  }

  public is(...types: string[]): string | false | null {
    return typeIs(this.req, types);
  }

  get contentType() {
    const type = this.getHeader('Content-Type') as string | undefined;

    if (!type) {
      return '';
    }

    return type.split(';')[0];
  }

  public getHeader(field: string): void | string | string[] {
    field = field.toLowerCase();

    switch (field) {
      // The `Referrer` header field is special-cased, both `Referrer` and `Referer` are interchangeable.
      case 'referer':
      case 'referrer':
        return this.req.headers.referrer || this.req.headers.referer;
      default:
        return this.req.headers[field];
    }
  }

  protected inspect() {
    if (!this.req) {
      return;
    }

    return this.toJSON();
  }

  public/*protected*/ toJSON(): Record<string, any> {
    return {
      method: this.method,
      url: this.url,
      header: this.headers,
    };
  }
}
