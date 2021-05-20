import { ConsoleApplication, ConsoleRouter, ConsoleSlotManager, validator } from '../../src';

let app: ConsoleApplication;
let router: ConsoleRouter<{}, {}>;

beforeEach(() => {
  app = new ConsoleApplication();
  router = new ConsoleRouter({
    slots: null,
  });
  app.mountCommand(router);
});

it('should throw error when mismatch command', async () => {
  try {
    await app.execute('not-exist');
    expect(true).toBeFalsy();
  } catch {
    expect(true).toBeTruthy();
  }
});

it('can create command', async () => {
  router.command('exists').action((ctx) => {
    ctx.state.testData = 20;
  });

  const ctx = await app.execute('exists');

  expect(ctx.state.testData).toBe(20);
});

it('can create command with options', async () => {
  router
    .command('test-command')
    .options({
      data: validator.number,
    })
    .action((ctx, payload) => {
      ctx.state.testData = payload.options.data * 2;
    });

  try {
    await app.execute('test-command');
    expect(true).toBeFalsy();
  } catch {
    expect(true).toBeTruthy();
  }

  const ctx = await app.execute('test-command', '--data', '41');
  expect(ctx.state.testData).toBe(82);

  const ctx1 = await app.execute('test-command', '--data', '2');
  expect(ctx1.state.testData).toBe(4);
});

it('can use slot', async () => {
  router
    .command('exists')
    .use(async (ctx, next) => {
      await next();
      ctx.state.testData = (ctx.state.testData as number) + 10;
    })
    .action((ctx) => {
      ctx.state.testData = 20;
    });

  const ctx = await app.execute('exists');

  expect(ctx.state.testData).toBe(30);
});

it('can use group slot', async () => {
  const router = new ConsoleRouter({
    slots: ConsoleSlotManager.use((ctx, next) => {
      ctx.state.test1 = 10;
      return next();
    }),
  });
  router.command('testx').action((ctx) => {
    ctx.state.test2 = !!ctx.state.test1;
  });

  app.mountCommand(router);

  const ctx = await app.execute('testx');

  expect(ctx.state.test1).toBe(10);
  expect(ctx.state.test2).toBe(true);
});
