import type { Next, Slot } from '../slot/Slot';

type Middleware = (ctx: any, next: Next) => Promise<any>;
type ExtraMiddleware = Middleware | Slot<any, any, any>;

export type Composer = ((ctx: any, next?: Next) => Promise<any>) & {
  get(): ExtraMiddleware[];
  set(middleware: ExtraMiddleware[]): void;
  append(...middleware: ExtraMiddleware[]): void;
  prepend(...middleware: ExtraMiddleware[]): void;
};

export function compose(middleware: ExtraMiddleware[]): Composer {
  let realMiddleware: Middleware[] = [];
  let middlewareLength: number = 0;

  const composer: Composer = (ctx, next) => {
    let lastIndex: number = -1;

    const dispatch = async (currentIndex: number): Promise<void> => {
      if (currentIndex <= lastIndex) {
        throw new Error('next() called multiple times');
      }

      lastIndex = currentIndex;

      const through = currentIndex === middlewareLength ? next : realMiddleware[currentIndex];
      if (through) {
        await through(ctx, dispatch.bind(null, currentIndex + 1));
      }
    }

    return dispatch(0);
  }

  const compile = (compiled: any[], sources: any[]) => {
    realMiddleware = compiled;

    for (let i = 0; i < sources.length; ++i) {
      const item = sources[i];

      if (typeof item === 'function') {
        realMiddleware.push(item);
      } else {
        realMiddleware.push(...item.collect());
      }
    }

    middlewareLength = realMiddleware.length;
  };

  composer.get = () => middleware;
  composer.set = (items) => {
    middleware = items;
    compile([], middleware);
  };
  composer.append = (...item) => {
    middleware.push(...item);
    compile(realMiddleware, item);
  };
  composer.prepend = (...item) => {
    middleware.unshift(...item);
    compile([], middleware);
  };

  compile([], middleware);

  return composer;
}
