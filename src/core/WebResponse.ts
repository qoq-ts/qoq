import { ServerResponse, OutgoingHttpHeaders, IncomingMessage } from 'http';
import { Stream } from 'stream';
import encodeUrl from 'encodeurl';
import onFinished from 'on-finished';
import escapeHtml from 'escape-html';
import { is as typeIs } from 'type-is';
import contentDisposition from 'content-disposition';
import vary from 'vary';
import statuses from 'statuses';
import { getMimeType } from '../util/getMimeType';
import { WebApplication } from './WebApplication';
import { WebContext } from './WebContext';
import { extname } from 'path';
import destroy from 'destroy';
import { setInspector } from '../util/setInspector';

export type ResponseBody = null | string | Buffer | Stream | object;

export class WebResponse {
  public readonly res: ServerResponse;
  public/*protected*/ readonly app: WebApplication;
  public/*protected*/ req?: IncomingMessage;
  public/*protected*/ ctx?: WebContext;
  public/*protected*/ explicitStatus: boolean = false;
  public/*protected*/ explicitNullBody: boolean = false;
  protected _body: ResponseBody = null;

  constructor(app: WebApplication, res: ServerResponse) {
    this.app = app;
    this.res = res;

    setInspector(this);
  }

  get socket() {
    return this.res.socket;
  };

  public getHeaders(): Required<OutgoingHttpHeaders> {
    return this.res.getHeaders();
  }

  public setHeaders(fields: OutgoingHttpHeaders) {
    for (const key of Object.keys(fields)) {
      const value = fields[key];
      if (value !== undefined) {
        this.setHeader(key, value);
      }
    }
  }

  public get statusCode(): number {
    return this.res.statusCode;
  }

  public set statusCode(code: number) {
    if (this.headersSent) {
      return;
    }

    this.explicitStatus = true;
    this.res.statusCode = code;

    if (this.ctx!.request.req.httpVersionMajor < 2) {
      this.res.statusMessage = statuses.message[code] || '';
    }

    // null | ''
    if (!this.body && statuses.empty[code]) {
      this.body = null;
    }
  }

  public get statusMessage(): string {
    return this.res.statusMessage || statuses.message[this.statusCode] || '';
  }

  public set statusMessage(msg: string) {
    this.res.statusMessage = msg;
  }

  public get body(): ResponseBody {
  return this._body;
  }

  public set body(val: ResponseBody) {
    const original = this._body;
    this.explicitNullBody = false;
    this._body = val;

    if (val === null) {
      if (!statuses.empty[this.statusCode]) {
        this.statusCode = 204;
      }

      this.explicitNullBody = true;
      this.removeHeader('Content-Type');
      this.removeHeader('Content-Length');
      this.removeHeader('Transfer-Encoding');
      return;
    }

    if (!this.explicitStatus) {
      this.statusCode = 200;
    }

    const setType = !this.hasHeader('Content-Type');

    if (typeof val === 'string') {
      if (setType) {
        this.contentType = /^\s*</.test(val) ? 'html' : 'text';
      }

      this.contentLength = Buffer.byteLength(val);
      return;
    }

    if (Buffer.isBuffer(val)) {
      if (setType) {
        this.contentType = 'bin';
      }

      this.contentLength = val.length;
      return;
    }

    if (val instanceof Stream) {
      onFinished(this.res, destroy.bind(null, val));

      if (original !== val) {
        val.once('error', err => this.ctx!.onerror(err));
      }

      // Steam must compare Transfer-Encoding: chunked
      this.removeHeader('Content-Length');

      if (setType) {
        this.contentType = 'bin';
      }

      return;
    }

    this.contentType = 'json';
    // The length of object is not clear until stringify.
    this.removeHeader('Content-Length');
  }

  public get contentLength(): number {
    if (this.hasHeader('Content-Length')) {
      return parseInt(this.getHeader('Content-Length') as string, 10) || 0;
    }

    const { body } = this;

    if (!body) {
      return  0;
    } else if (body instanceof Stream) {
      return -1;
    } else if ('string' === typeof body) {
      return Buffer.byteLength(body);
    } else if (Buffer.isBuffer(body)) {
      return body.length;
    } else {
      return Buffer.byteLength(JSON.stringify(body));
    }
  }

  public set contentLength(length: number) {
    this.setHeader('Content-Length', length);
  }

  public get headersSent(): boolean {
    return this.res.headersSent;
  }

  public vary(field: string | string[]): void {
    if (this.headersSent) {
      return;
    }

    vary(this.res, field);
  }

  redirect(url: string, alt: string) {
    if ('back' === url) {
      url = this.getHeader('Referrer') as string | undefined || alt || '/';
    };
    this.setHeader('Location', encodeUrl(url));

    if (!statuses.redirect[this.statusCode]) {
      this.statusCode = 302;
    }

    // html
    if (this.ctx!.request.accepts('html')) {
      url = escapeHtml(url);
      this.contentType = 'text/html; charset=utf-8';
      this.body = `Redirecting to <a href="${url}">${url}</a>.`;
      return;
    }

    // text
    this.contentType = 'text/plain; charset=utf-8';
    this.body = `Redirecting to ${url}.`;
  }

  attachment(filename: string, options: contentDisposition.Options) {
    if (filename) {
      this.contentType = extname(filename);
    }

    this.setHeader('Content-Disposition', contentDisposition(filename, options));
  }

  public set contentType(type: string) {
    this.setHeader('Content-Type', getMimeType(type));
  }

  public get contentType(): string {
    const type = this.getHeader('Content-Type') as string | undefined;

    if (!type) {
      return '';
    }

    return type.split(';')[0] || '';
  }

  set lastModified(val: Date | undefined) {
    if (val === undefined) {
      this.removeHeader('Last-Modified');
      return;
    }

    // Compatible with koa
    if (typeof val === 'string') {
      val = new Date(val);
    }

    this.setHeader('Last-Modified', val.toUTCString());
  }

  get lastModified(): Date | undefined {
    const date = this.getHeader('last-modified') as string | undefined;

    if (date) {
      return new Date(date);
    }

    return;
  }

  set etag(val: string) {
    if (!/^(W\/)?"/.test(val)) {
      val = `"${val}"`;
    }

    this.setHeader('ETag', val);
  }

  get etag(): string {
    return this.getHeader('ETag') as string || '';
  }

  is(type: string, ...types: string[]) {
    return typeIs(this.contentType, type, ...types);
  }

  public getHeader(field: string) {
    return this.getHeaders()[field.toLowerCase()] || '';
  }

  public hasHeader(field: string): boolean {
    return this.res.hasHeader(field);
  }

  public setHeader(field: string, value: string | number | string[]): void;
  public setHeader(fields: Record<string, string | number | string[]>): void;
  public setHeader(field: string | Record<string, string | number | string[]>, value?: string | number | string[]): void {
    if (this.headersSent) {
      return;
    }

    if (typeof field === 'string') {
      if (Array.isArray(value)) {
        value = value.map((item) => typeof item === 'string' ? item : String(item));
      } else if (typeof value !== 'string') {
        value = String(value);
      }

      this.res.setHeader(field, value);
    } else {
      for (const [n, v] of Object.entries(field)) {
        this.setHeader(n, v);
      }
    }
  }

  appendHeader(field: string, value: string | string[]) {
    const prev = this.getHeader(field) as string | string[] | undefined;

    if (prev) {
      value = Array.isArray(prev) ? prev.concat(value) : [prev].concat(value);
    }

    return this.setHeader(field, value);
  }

  public removeHeader(field: string): void {
    if (this.headersSent) {
      return;
    }

    this.res.removeHeader(field);
  }

  public get writable(): boolean {
    // can't write any more after response finished
    // response.writableEnded is available since Node > 12.9
    // https://nodejs.org/api/http.html#http_response_writableended
    // response.finished is undocumented feature of previous Node versions
    // https://stackoverflow.com/questions/16254385/undocumented-response-finished-in-node-js
    if (this.res.writableEnded || this.res.finished) {
      return false;
    }

    const socket = this.res.socket;
    // There are already pending outgoing res, but still writable
    // https://github.com/nodejs/node/blob/v4.4.7/lib/_http_server.js#L486
    return socket ? socket.writable : true;
  }

  protected inspect() {
    if (!this.res) {
      return;
    }

    const o = this.toJSON();
    o.body = this.body;
    return o;
  }

  public/*protected*/ toJSON(): Record<string, any> {
    return {
      status: this.statusCode,
      message: this.statusMessage,
      header: this.getHeaders(),
    };
  }

  flushHeaders() {
    this.res.flushHeaders();
  }
}
