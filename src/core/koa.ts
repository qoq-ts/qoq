// To compatible with koa2, we should hold the same behaviors.
import Delegates from 'delegates';
import { Alias } from '../util/Alias';
import { WebContext } from './WebContext';
import { WebResponse } from './WebResponse';
import { WebRequest } from './WebRequest';

new Alias(WebResponse)
  .method('remove', 'removeHeader')
  .method('has', 'hasHeader')
  .method('set', 'setHeader')
  .method('get', 'getHeader')
  .method('append', 'appendHeader')

  .access('status', 'statusCode')
  .access('message', 'statusMessage')
  .access('length', 'contentLength')
  .access('type', 'contentType')

  .getter('headerSent', 'headersSent')
  .getter('header', 'getHeaders', true)
  .getter('headers', 'getHeaders', true);

new Alias(WebRequest)
  .method('get', 'getHeader')

  .access('header', 'headers')

  .getter('header', 'getHeader', true)
  .getter('type', 'contentType')
  .getter('length', 'contentLength')
  .getter('query', '_query');

new Delegates(WebContext.prototype, 'response')
  .method('attachment')
  .method('redirect')
  .method('remove')
  .method('vary')
  .method('has')
  .method('set')
  .method('append')
  .method('flushHeaders')

  .access('status')
  .access('message')
  .access('body')
  .access('length')
  .access('type')
  .access('lastModified')
  .access('etag')

  .getter('headerSent')
  .getter('writable');

new Delegates(WebContext.prototype, 'request')
  .method('acceptsLanguages')
  .method('acceptsEncodings')
  .method('acceptsCharsets')
  .method('accepts')
  .method('get')
  .method('is')

  .access('querystring')
  .access('idempotent')
  .access('socket')
  .access('search')
  .access('method')
  .access('query')
  .access('path')
  .access('url')
  .access('accept')

  .getter('origin')
  .getter('href')
  .getter('subdomains')
  .getter('protocol')
  .getter('host')
  .getter('hostname')
  .getter('URL')
  .getter('header')
  .getter('headers')
  .getter('secure')
  .getter('stale')
  .getter('fresh')
  .getter('ips')
  .getter('ip');
