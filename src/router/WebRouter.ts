import { Slot, WebSlotCtx } from '../slot/Slot';
import { SlotManager, WebSlotManager } from '../slot/SlotManager';
import { compose, Composer } from '../util/compose';
import { Method } from '../util/Method';
import { toArray } from '../util/toArray';
import { Router } from './Router';
import { WebBuilder } from './WebBuilder';

interface WebRouterOptions<Props, State> {
  prefix?: string;
  slots?: SlotManager<Slot.Web | Slot.Mix, Props, State>,
}

export const createWebRouter = <Props, State, P, S>(
  globalSlots: SlotManager<Slot.Web | Slot.Mix, Props, State>,
  options: WebRouterOptions<P, S> = {}
): WebRouter<Props & P, State & S> => {
  return new WebRouter(globalSlots, options);
};

export class WebRouter<Props = any, State = any> extends Router<Slot.Web | Slot.Mix, WebBuilder<any, any>> {
  constructor(
    globalSlots: SlotManager<Slot.Web | Slot.Mix, any, any>,
    options: WebRouterOptions<Props, State>
  ) {
    super(
      (options.prefix || '').replace(/\/+$/, ''),
      globalSlots,
      options.slots || WebSlotManager,
    );
  }

  public get(uri: string | string[]): WebBuilder<Props, State> {
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

  public/*protected*/ createMiddleware(globalToLocal?: Composer): WebSlotCtx {
    const builders = this.builders;
    const groupSlots = this.groupSlots.getSlots();

    return (ctx, next) => {
      const { path, method } = ctx.request;
      const middleware: Array<Slot<Slot.Web> | WebSlotCtx> = [];

      for (let i = 0; i < builders.length; ++i) {
        const builder = builders[i]!;
        const params = builder.matchAndGetParams(path, method);

        if (params) {
          middleware.push(
            (_ctx, _next) => {
              const { request } = _ctx;

              // Reset dynamic data
              // @ts-expect-error
              request['query'] = request['body'] = request['params'] = undefined;
              request.rawParams = params;

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

      middleware.unshift(...groupSlots);
      globalToLocal && middleware.unshift(globalToLocal);

      return compose(middleware)(ctx, next);
    };
  }
}
