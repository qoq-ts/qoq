import { pathToRegexp, Key } from 'path-to-regexp';
import { Slot } from '../slot/Slot';
import { Use } from '../slot/SlotManager';
import { Method } from '../util/Method';
import { Validator, ValidatorTypes } from '../validator/Validator';
import { Builder } from './Builder';
import { Next } from 'koa';
import { WebCtx } from '../core/WebContext';
import { queryParser } from '../parser/queryParser';
import { bodyParser } from '../parser/bodyParser';
import { paramParser } from '../parser/paramParser';
import { validator } from '../validator';

export interface WebRouterDocument {
  category?: string;
  title?: string;
  description?: string;
  response?: Validator | Record<string, Validator>;
  headers?: Record<string, Validator>;
  additional?: Record<string, any>;
}

export type WebRouterSchema = ReturnType<WebBuilder['toJSON']> extends Promise<infer R> ? R : never;

export class WebBuilder<
  Props = any,
  State = any,
  Param extends string = string,
  Payload extends { [key: string]: object } = {}
> extends Builder<Slot.Web | Slot.Mix, Props, State, Payload> {
  protected readonly uris: string[];
  protected readonly methods: Method[];
  protected readonly uriPatterns: ([RegExp, Key[], string | undefined])[];
  protected docs?: (() => Promise<WebRouterDocument>) | WebRouterDocument;

  protected queryRules?: Record<string, Validator>;
  protected bodyRules?: Record<string, Validator>;
  protected paramRules?: Record<string, Validator>;

  protected declare payload: {
    query?: ReturnType<typeof queryParser>;
    body?: ReturnType<typeof bodyParser>;
    params?: ReturnType<typeof paramParser>;
  };

  constructor(prefix: string, uris: string[], methods: Method[]) {
    super();

    this.methods = methods;
    this.uris = uris;
    this.uriPatterns = [];

    for (let i = 0; i < uris.length; ++i) {
      const uri = (prefix + (uris[i] === '/' ? '' : uris[i])) || '/';

      const keysRef: Key[] = [];
      this.uriPatterns.push([
        pathToRegexp(uri, keysRef),
        keysRef,
        /^[\/a-z0-9-_]+$/i.test(uri) ? uri : undefined,
      ]);
    }
  }

  public declare use: <P, S>(slot: Use<Slot.Mix | Slot.Web, P, S>) => WebBuilder<Props & P, State & S, Param, Payload>;

  public query<T extends { [key: string]: Validator }>(rules: T): WebBuilder<Props, State, Param, Omit<Payload, 'query'> & { query: ValidatorTypes<T> }> {
    this.queryRules = rules;
    this.payload.query = queryParser(rules);
    // @ts-ignore
    return this;
  }

  public body<T extends { [key: string]: Validator }>(rules: T): WebBuilder<Props & { request: { body: Record<string, unknown> } }, State, Param, Omit<Payload, 'body'> & { body: ValidatorTypes<T> }> {
    this.bodyRules = rules;
    this.payload.body = bodyParser(rules);
    // @ts-ignore
    return this;
  }

  public params<T extends { [key in Param]: Validator }>(rules: T): WebBuilder<Props, State, Param, Omit<Payload, 'params'> & { params: ValidatorTypes<T> }> {
    this.paramRules = rules;
    this.payload.params = paramParser(rules);
    // @ts-ignore
    return this;
  }

  public action<P = {}, S = {}>(fn: (ctx: WebCtx<Props & P, State & S>, payload: Payload, next: Next) => any): WebBuilder<Props & P, State & S, Param, Payload> {
    return this.useAction(fn), this;
  }

  /**
   * Describe router schema.
   *
   * Feel free to load schema from other file by lazy import.
   * ```javascript
   * router
   *  .get('/')
   *  .document(async () => {
   *     // Assuming you create a file `router.doc.ts` with content: .
   *     const document = await import('./router.doc');
   *     return document.default;
   *  });
   * ```
   * @see WebRouterDocument
   */
  public document(document: (() => Promise<WebRouterDocument>) | WebRouterDocument): this {
    this.docs = document;
    return this;
  }

  public/*protected*/ matchAndGetParams(path: string, method: Method): false | Record<string, string> {
    if (!this.methods.includes(method)) {
      return false;
    }

    for (let i = 0; i < this.uriPatterns.length; ++i) {
      const [regexp, keys, pureUri] = this.uriPatterns[i]!;
      const params: Record<string, any> = {};

      if (pureUri === path) {
        return params;
      }

      const captures = path.match(regexp);
      if (captures === null) {
        continue;
      }

      if (!keys.length) {
        return params;
      }

      for (let keyIndex = 0; keyIndex < captures.length; ++keyIndex) {
        const key = keys[keyIndex];

        if (key) {
          const capture = captures[keyIndex + 1];
          params[key.name] = capture ? this.decodeURIComponent(capture) : capture;
        }
      }

      return params;
    }

    return false;
  }

  protected decodeURIComponent(text: string): any {
    try {
      return decodeURIComponent(text);
    } catch {
      return text;
    }
  }

  public/*protected*/ async toJSON() {
    type TransformData = { [key: string]: ReturnType<Validator['toJSON']> };

    const docs = typeof this.docs === 'function'
      ? await this.docs()
      : this.docs || {};
    const headers: TransformData = {};
    const query: TransformData = {};
    const body: TransformData = {};
    const params: TransformData = {};
    let response: ReturnType<Validator['toJSON']> | TransformData | undefined;

    if (docs.response instanceof Validator) {
      response = docs.response.toJSON();
    } else if (docs.response) {
      response = validator.json.constraint(docs.response).toJSON();
    }

    ([
      [docs.headers, headers],
      [this.queryRules, query],
      [this.bodyRules, body],
      [this.paramRules, params]
    ] as const).map((item) => {
      Object.entries(item[0] ?? {}).map(([key, validator]) => {
        item[1][key] = validator.toJSON();
      });
    });

    return {
      uris: this.uris,
      method: this.methods[0]!,
      title: docs.title || '',
      description: docs.description || '',
      response,
      headers,
      query,
      body,
      params,
      additional: docs.additional || {},
    };
  }
}
