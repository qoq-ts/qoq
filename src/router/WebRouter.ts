import compose, { Middleware } from 'koa-compose';
import { WebCtx } from '../core/WebContext';
import { Slot, WebSlotCtx } from '../slot/Slot';
import { SlotManager, WebSlotManager } from '../slot/SlotManager';
import { Method } from '../util/Method';
import { toArray } from '../util/toArray';
import { Router } from './Router';
import { WebBuilder } from './WebBuilder';

interface WebRouterOptions<Props, State> {
  prefix?: string;
  slots: SlotManager<Slot.Web | Slot.Mix, Props, State> | null,
}

// _ is valid variable letter
type InvalidCharacter = '/' | '(' | ')' | '.' | ',' | '+' | '*' | '-' | '?' | '#' | '[' | ']' | '\\' | '|' | '{' | '}' | '=' | '&' | '<' | '>' | '@' | '!' | '~' | ' ' | '$' | '^' | '%';

type GetParam<T extends string> = (
  T extends `:${infer U}${InvalidCharacter}${infer R}`
    ? GetParam<`:${U}`> | (R extends string ? GetParam<R> : never)
    : T extends `:${infer U}`
      ? U extends `:${string}`
        ? GetParam<U>
        : U extends `${infer R}:`
          ? GetParam<`:${R}`>
          : U
      : T extends `${string}:${infer R}`
        ? GetParam<`:${R}`>
        : never
);

type Param<T extends string> = {
  params: {
    [key in GetParam<T>]?: string;
  }
}

export class WebRouter<Props = {}, State = {}> extends Router<Slot.Web | Slot.Mix, WebBuilder<any, any>> {
  constructor(options: WebRouterOptions<Props, State>) {
    super((options.prefix || '').replace(/\/+$/, ''), options.slots || WebSlotManager.use(null));
  }

  public get<T extends string>(uri: T | T[]): WebBuilder<Props & Param<T>, State, GetParam<T>> {
    const builder = new WebBuilder(this.prefix, toArray(uri), [Method.get, Method.head]);
    this.builders.push(builder);
    return builder;
  }

  public post<T extends string>(uri: T | T[]): WebBuilder<Props & Param<T>, State, GetParam<T>> {
    const builder = new WebBuilder(this.prefix, toArray(uri), [Method.post]);
    this.builders.push(builder);
    return builder;
  }

  public put<T extends string>(uri: T | T[]): WebBuilder<Props & Param<T>, State, GetParam<T>> {
    const builder = new WebBuilder(this.prefix, toArray(uri), [Method.put]);
    this.builders.push(builder);
    return builder;
  }

  public patch<T extends string>(uri: T | T[]): WebBuilder<Props & Param<T>, State, GetParam<T>> {
    const builder = new WebBuilder(this.prefix, toArray(uri), [Method.patch]);
    this.builders.push(builder);
    return builder;
  }

  public delete<T extends string>(uri: T | T[]): WebBuilder<Props & Param<T>, State, GetParam<T>> {
    const builder = new WebBuilder(this.prefix, toArray(uri), [Method.delete]);
    this.builders.push(builder);
    return builder;
  }

  public all<T extends string>(uri: T | T[]): WebBuilder<Props & Param<T>, State, GetParam<T>> {
    const builder = new WebBuilder(this.prefix, toArray(uri), Object.values(Method));
    this.builders.push(builder);
    return builder;
  }

  public/*protected*/ createMiddleware(): WebSlotCtx {
    const builders = this.builders;
    const groupMiddleware = this.globalSlots.getBranchMiddleware();
    const groupCompose = groupMiddleware.length > 0 && compose(groupMiddleware);

    return (ctx, next) => {
      const { path, method } = ctx.request;
      const middleware: Middleware<WebCtx>[] = [];
      let matched: boolean = false;
      groupCompose && middleware.push(groupCompose);

      for (let i = 0; i < builders.length; ++i) {
        const builder = builders[i]!;
        const params = builder.matchAndGetParams(path, method as Method);

        if (params) {
          matched = matched || true;
          middleware.push(
            (_ctx, _next) => (
              // @ts-expect-error
              _ctx.params = params,
              _next()
            ),
            ...builder.getMiddleware(),
          );
        }
      }

      // No path is found
      if (!matched) {
        return next();
      }

      return compose(middleware)(ctx, next);
    };
  }
}
