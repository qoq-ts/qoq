import { pathToRegexp, Key } from 'path-to-regexp';
import { Action } from '../slot/Action';
import { Body, BodyValidation } from '../slot/Body';
import { Param, ParamValidation } from '../slot/Param';
import { Query, QueryValidation } from '../slot/Query';
import { Slot, WebSlotCtx } from '../slot/Slot';
import { SlotManager } from '../slot/SlotManager';
import { Method } from '../util/Method';
import { Validator } from '../validator/Validator';
import { Builder } from './Builder';

export class WebBuilder<Props = any, State = any, Param extends string = string> extends Builder<Slot.Web | Slot.Mix, Props, State> {
  protected readonly uris: string[];
  protected readonly methods: Method[];
  protected readonly uriPatterns: ([RegExp, Key[]] | string)[];

  protected queryData: Record<string, Validator> = {};
  protected bodyData: Record<string, Validator> = {};
  protected paramData: Record<string, Validator> = {};

  constructor(prefix: string, uris: string[], methods: Method[]) {
    super();

    this.methods = methods;
    this.uris = uris;
    this.uriPatterns = [];

    for (let i = 0; i < uris.length; ++i) {
      const uri = prefix + (uris[i] === '/' ? '' : uris[i]);

      if (/^[\/a-z0-9]+$/i.test(uri)) {
        this.uriPatterns.push(uri);
      } else {
        const keysRef: Key[] = [];
        this.uriPatterns.push([
          pathToRegexp(uri, keysRef),
          keysRef
        ]);
      }
    }
  }

  public use<P, S>(
    slot: Slot<Slot.Mix | Slot.Web, P, S> | SlotManager<Slot.Mix | Slot.Web, P, S>
  ): WebBuilder<Props & P, State & S, Param> {
    this.slots = this.slots.use(slot);
    return this;
  }

  public query<T extends { [key: string]: Validator }>(rules: T): WebBuilder<Props & QueryValidation<T>, State, Param> {
    this.queryData = rules;
    this.use(Query(rules));
    return this;
  }

  public body<T extends { [key: string]: Validator }>(rules: T): WebBuilder<Props & BodyValidation<T>, State, Param> {
    this.bodyData = rules;
    this.use(Body(rules));
    return this;
  }

  public params<T extends (Param extends string ? { [key in Param]: Validator } : never)>(rules: T): WebBuilder<Props & ParamValidation<T>, State, Param> {
    this.paramData = rules;
    this.use(Param(rules));
    return this;
  }

  public action<P = {}, S = {}>(fn: WebSlotCtx<Props & P, State & S>): WebBuilder<Props & P, State & S, Param> {
    this.use(Action(fn));
    return this;
  }

  public/*protected*/ matchAndGetParams(path: string, method: Method): false | Record<string, string> {
    if (!this.methods.includes(method)) {
      return false;
    }

    for (let i = 0; i < this.uriPatterns.length; ++i) {
      const pattern = this.uriPatterns[i]!;
      const params: Record<string, any> = {};

      // Normal Path, to be compare faster.
      if (typeof pattern === 'string') {
        if (pattern == path) {
          return params;
        }
        continue;
      }

      const [regexp, keys] = pattern;
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

  public/*protected*/ toJSON() {
    return {};
  }
}
