import { compose, Composer, MixSlotCtx, Slot } from '../../src';
import { ExtraMiddleware, Middleware } from '../../src/util/compose';

const createSlot = (fn: MixSlotCtx) => {
  const Wrapper = class extends Slot<Slot.Mix> {
    constructor() {
      super();
      this.use(fn);
    }
  }

  return new Wrapper();
};

describe('compose', () => {
  it ('can input function', async () => {
    const ids: number[] = [];
    const slots: Middleware[] = [
      async (_, next) => {
        ids.push(1);
        await next();
        ids.push(6);
      },
      async (_, next) => {
        ids.push(2);
        await next();
        ids.push(5);
      },
      async (_, next) => {
        ids.push(3);
        await next();
        ids.push(4);
      },
    ];

    await compose(slots)({});
    expect(ids.join(',')).toBe('1,2,3,4,5,6');
  });

  it ('can input slots', async () => {
    const ids: number[] = [];
    const slots: Slot[] = [
      createSlot(async (_, next) => {
        ids.push(1);
        await next();
        ids.push(6);
      }),
      createSlot(async (_, next) => {
        ids.push(2);
        await next();
        ids.push(5);
      }),
      createSlot(async (_, next) => {
        ids.push(3);
        await next();
        ids.push(4);
      }),
    ];

    await compose(slots)({});
    expect(ids.join(',')).toBe('1,2,3,4,5,6');
  });

  it ('can input compose', async () => {
    const ids: number[] = [];
    const slots: Composer[] = [
      compose([
        createSlot(async (_, next) => {
          ids.push(1);
          await next();
          ids.push(6);
        }),
        createSlot(async (_, next) => {
          ids.push(2);
          await next();
          ids.push(5);
        }),
      ]),
      compose([
        createSlot(async (_, next) => {
          ids.push(3);
          await next();
          ids.push(4);
        }),
      ]),
    ];

    await compose(slots)({});
    expect(ids.join(',')).toBe('1,2,3,4,5,6');
  });

  it ('can input mixed values', async () => {
    const ids: number[] = [];
    const slots: ExtraMiddleware[] = [
      createSlot(async (_, next) => {
        ids.push(1);
        await next();
        ids.push(6);
      }),
      async (_, next) => {
        ids.push(2);
        await next();
        ids.push(5);
      },
      createSlot(async (_, next) => {
        ids.push(3);
        await next();
        ids.push(4);
      }),
    ];

    await compose(slots)({});
    expect(ids.join(',')).toBe('1,2,3,4,5,6');
  });

  it ('can replace middleware', async () => {
    const ids: number[] = [];
    const empty: Slot[] = [];
    const slots: Slot[] = [
      createSlot(async (_, next) => {
        ids.push(1);
        await next();
        ids.push(6);
      }),
      createSlot(async (_, next) => {
        ids.push(2);
        await next();
        ids.push(5);
      }),
      createSlot(async (_, next) => {
        ids.push(3);
        await next();
        ids.push(4);
      }),
    ];
    const composer = compose(empty);
    await composer({});
    expect(ids.join(',')).toBe('');

    composer.set(slots);
    await composer({});
    expect(ids.join(',')).toBe('1,2,3,4,5,6');
  });

  it ('can append slots', async () => {
    const ids: number[] = [];
    const slots: Slot[] = [
      createSlot(async (_, next) => {
        ids.push(1);
        await next();
        ids.push(6);
      }),
    ];

    const composer = compose(slots);
    await composer({});
    expect(ids.join(',')).toBe('1,6');

    ids.splice(0, 10);
    composer.append(
      createSlot(async (_, next) => {
        ids.push(2);
        await next();
        ids.push(5);
      }),
      createSlot(async (_, next) => {
        ids.push(3);
        await next();
        ids.push(4);
      }),
    );
    await composer({});
    expect(ids.join(',')).toBe('1,2,3,4,5,6');
  });

  it ('can prepend slots', async () => {
    const ids: number[] = [];
    const slots: Slot[] = [
      createSlot(async (_, next) => {
        ids.push(1);
        await next();
        ids.push(6);
      }),
    ];

    const composer = compose(slots);
    composer.prepend(
      createSlot(async (_, next) => {
        ids.push(2);
        await next();
        ids.push(5);
      }),
      createSlot(async (_, next) => {
        ids.push(3);
        await next();
        ids.push(4);
      }),
    );
    composer.prepend(
      createSlot(async (_, next) => {
        ids.push(7);
        await next();
        ids.push(8);
      }),
    );
    await composer({});
    expect(ids.join(',')).toBe('7,2,3,1,6,4,5,8');
  });

  it ('can not execute next() more than once', async () => {
    let msg: string = '';

    const slots: Middleware[] = [
      async (_, next) => {
        try {
          await next();
          await next();
        } catch (e) {
          msg = e.message;
        }
      },
    ];

    await compose(slots)({});
    expect(msg).toContain('next()');
  });

  it ('context will run through the compose', async () => {
    const ctx: Record<string, number> = {};
    const slots: Middleware[] = [
      async (_, next) => {
        ctx.test1 = 1;
        await next();
      },
      async (_, next) => {
        ctx.test2 = 2;
        await next();
      },
    ];

    await compose(slots)(ctx);
    expect(ctx).toMatchObject({
      test1: 1,
      test2: 2,
    });
  });

  it ('run compose with context and next', async () => {
    const ids: number[] = [];
    const slots: Middleware[] = [
      async (_, next) => {
        ids.push(1);
        await next();
        ids.push(3);
      },
    ];

    await compose(slots)({}, async () => {
      ids.push(2);
    });
    expect(ids.join(',')).toBe('1,2,3');
  });

  it ('can interrupt middleware when next() is skipped', async () => {
    const ids: number[] = [];
    const slots: Middleware[] = [
      async (_, next) => {
        ids.push(1);
        await next();
        ids.push(6);
      },
      async (_ctx, _next) => {
        ids.push(2);
      },
      async (_ctx, next) => {
        ids.push(3);
        await next();
        ids.push(5);
      },
      async (_ctx, next) => {
        ids.push(4);
        await next();
      },
    ];

    await compose(slots)({});
    expect(ids.join(',')).toBe('1,2,6');
  });
});
