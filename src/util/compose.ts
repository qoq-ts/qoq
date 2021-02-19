import type { Next, Slot } from '../slot/Slot';

export type Middleware = (ctx: any, next: Next) => Promise<any>;
export type ExtraMiddleware = Middleware | Slot<any, any, any>;

export type Composer = ((ctx: any, next?: Next) => Promise<any>) & {
  set(middleware: ExtraMiddleware[]): void;
  append(...middleware: ExtraMiddleware[]): void;
  prepend(...middleware: ExtraMiddleware[]): void;
};

const compile = (sources: ExtraMiddleware[]): Middleware[] => {
  let middleware: Middleware[] = [];

  for (let i = 0; i < sources.length; ++i) {
    const item = sources[i]!;

    if (typeof item === 'function') {
      middleware.push(item);
    } else {
      middleware = middleware.concat(item.collect());
    }
  }

  return middleware;
};

export function compose(mix: ExtraMiddleware[]): Composer {
  let middleware: Middleware[] = compile(mix);

  const composer: Composer = (ctx, next) => {
    const length = middleware.length;
    let lastIndex: number = -1;
    let through: Middleware | undefined;

    const dispatch = (i: number): Promise<void> => {
      if (i <= lastIndex) {
        throw new Error('next() called multiple times');
      }

      if (through = (lastIndex = i) === length ? next : middleware[i]) {
        try {
          return Promise.resolve(through(ctx, () => dispatch(i + 1)));
        } catch (e) {
          return Promise.reject(e);
        }
      }

      return Promise.resolve();
    }

    return dispatch(0);
  }

  composer.set = (items) => {
    middleware = compile(items);
  };

  composer.append = function () {
    middleware = middleware.concat(compile(arguments as unknown as ExtraMiddleware[]));
  };

  composer.prepend = function () {
    middleware = compile(arguments as unknown as ExtraMiddleware[]).concat(middleware);
  };

  return composer;
}
