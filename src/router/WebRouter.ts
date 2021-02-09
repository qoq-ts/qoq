import { Slot, WebSlotCtx } from '../slot/Slot';
import { SlotManager } from '../slot/SlotManager';
import { compose, Composer } from '../util/compose';
import { Method } from '../util/Method';
import { toArray } from '../util/toArray';
import { Router } from './Router';
import { WebBuilder } from './WebBuilder';

interface WebRouterOptions<Props, State> {
  prefix?: string;
  slots: SlotManager<Slot.Web | Slot.Mix, Props, State>,
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

export class WebRouter<Props = any, State = any> extends Router<Slot.Web | Slot.Mix, WebBuilder<any, any>> {
  constructor(options: WebRouterOptions<Props, State>) {
    super((options.prefix || '').replace(/\/+$/, ''), options.slots);
  }

  public get<T extends string>(uri: T | T[]): WebBuilder<Props, State, GetParam<T>> {
    const builder = new WebBuilder(this.prefix, toArray(uri), [Method.get, Method.head]);
    this.builders.push(builder);
    return builder;
  }

  public post(uri: string | string[]): WebBuilder<Props, State> {
    const builder = new WebBuilder(this.prefix, toArray(uri), [Method.post]);
    this.builders.push(builder);
    return builder;
  }

  public put(uri: string | string[]): WebBuilder<Props, State> {
    const builder = new WebBuilder(this.prefix, toArray(uri), [Method.put]);
    this.builders.push(builder);
    return builder;
  }

  public patch(uri: string | string[]): WebBuilder<Props, State> {
    const builder = new WebBuilder(this.prefix, toArray(uri), [Method.patch]);
    this.builders.push(builder);
    return builder;
  }

  public delete(uri: string | string[]): WebBuilder<Props, State> {
    const builder = new WebBuilder(this.prefix, toArray(uri), [Method.delete]);
    this.builders.push(builder);
    return builder;
  }

  public all(uri: string | string[]): WebBuilder<Props, State> {
    const builder = new WebBuilder(this.prefix, toArray(uri), Object.values(Method));
    this.builders.push(builder);
    return builder;
  }

  public/*protected*/ createMiddleware(globalToGroup?: Composer): WebSlotCtx {
    const builders = this.builders;

    return (ctx, next) => {
      const { path, method } = ctx.request;
      const middleware: Array<Slot<Slot.Web> | WebSlotCtx> = [];

      for (let i = 0; i < builders.length; ++i) {
        const builder = builders[i]!;
        const params = builder.matchAndGetParams(path, method);

        if (params) {
          middleware.push(
            (_ctx, _next) => {
              _ctx._params = params;
              // @ts-expect-error
              _ctx['params'] = undefined;
              return _next();
            },
            ...builder.getSlots(),
          );
        }
      }

      // No path is found
      if (!middleware.length) {
        return next();
      }

      globalToGroup && middleware.unshift(globalToGroup);

      return compose(middleware)(ctx, next);
    };
  }
}
