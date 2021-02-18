import { Cache, createConfig, MemoryCacheOptions, Tree, validator, WebApplication, WebRouter, WebSlotManager } from '../../src';
import request from 'supertest';
import { SlotDemo1 } from '../fixture/SlotDemo1';

describe('Web Router', () => {
  let app: WebApplication;
  let router: WebRouter<{}, {}>;
  let server: ReturnType<typeof request>;

  beforeEach(() => {
    app = new WebApplication();
    router = new WebRouter({
      slots: new WebSlotManager(),
    });
    app.appendRoutes(router);
    server = request(app.listen());
  });

  it ('should respond 404 without router', async () => {
    await server.get('/').expect(404);
  });

  it ('can create router with method get + query', async () => {
    router
      .get('/')
      .query({
        name: validator.string.default('World'),
      })
      .action(async (ctx) => {
        ctx.send('Hello ' + ctx.query.name);
      });

    await server.head('/').expect(200);
    await server.get('/').expect('Hello World').expect(200);
    await server.get('/?name=Google').expect('Hello Google').expect(200);
  });

  it ('can create router with method post + payload', async () => {
    router
      .post('/user')
      .payload({
        name: validator.string,
        age: validator.number,
      })
      .action(async (ctx) => {
        ctx.send({
          name: ctx.payload.name,
          age: ctx.payload.age
        }, 201);
      });

    await server
      .post('/user')
      .send({
        name: 'bob',
        age: 20,
      })
      .expect(201)
      .expect({
        name: 'bob',
        age: 20,
      });
  });

  it ('can create router with method put', async () => {
    router
      .put('/user/:id')
      .params({
        id: validator.number,
      })
      .payload({
        name: validator.string,
        age: validator.number,
      })
      .action(async (ctx) => {
        ctx.send({
          id: ctx.params.id,
          name: ctx.payload.name,
          age: ctx.payload.age,
        }, 202);
      });

    await server
      .put('/user/1')
      .send({
        name: 'tom',
        age: 21,
      })
      .expect(202)
      .expect({
        id: 1,
        name: 'tom',
        age: 21,
      });
  });

  it ('can create router with method patch', async () => {
    router
      .patch('/user/:id')
      .params({
        id: validator.number,
      })
      .payload({
        name: validator.string.optional(),
        age: validator.number.optional(),
      })
      .action(async (ctx) => {
        ctx.send({
          id: ctx.params.id,
          name: ctx.payload.name,
          age: ctx.payload.age,
        }, 202);
      });

    await server
      .patch('/user/1')
      .send({
        name: 'tom',
      })
      .expect(202)
      .expect({
        id: 1,
        name: 'tom',
      });
  });

  it ('can create router with method delete', async () => {
    router.delete('/user/:id')
      .params({
        id: validator.number,
      })
      .action(async (ctx) => {
        ctx.send(null, 204);
      });

    await server.delete('/user/1').expect(204);
  });

  it ('can create router with all methods', async () => {
    router
      .all('/hello')
      .action(async (ctx) => {
        ctx.send('Hello World');
      });

    await server.head('/hello').expect(200);
    await server.get('/hello').expect('Hello World').expect(200);
    await server.post('/hello').expect('Hello World').expect(200);
    await server.put('/hello').expect('Hello World').expect(200);
    await server.patch('/hello').expect('Hello World').expect(200);
    await server.delete('/hello').expect('Hello World').expect(200);
  });

  it ('will respond 404 when method not matched', async () => {
    router
      .get('/')
      .action(async (ctx) => {
        ctx.send('Hello');
      });

    await server.post('/').expect(404);
    await server.put('/').expect(404);
  });

  it ('will respond 404 when url not matched', async () => {
    router
      .get('/')
      .action(async (ctx) => {
        ctx.send('Hello');
      });

    await server.get('/hello').expect(404);
  });

  it ('can parse complex params', async () => {
    router
      .get(['/(admin|a)', '/adm', '/ada'])
      .action(async (ctx) => {
        ctx.send('Hello: Admin');
      });

    await server.get('/admin').expect('Hello: Admin');
    await server.get('/a').expect('Hello: Admin');
    await server.get('/adm').expect('Hello: Admin');
    await server.get('/ada').expect('Hello: Admin');

    router
      .get('/users/:id?')
      .params({
        id: validator.number.default(10),
      })
      .action(async (ctx) => {
        ctx.send('Hello: ' + ctx.params.id);
      });

    router
      .get('/users-:name')
      .params({
        name: validator.string,
      })
      .action(async (ctx) => {
        ctx.send('Hi: ' + ctx.params.name);
      });

    await server.get('/users').expect('Hello: 10');
    await server.get('/users/20').expect('Hello: 20');
    await server.get('/users-bob').expect('Hi: bob');
  });

  it ('can use group slots', async () => {
    const globalSlots = WebSlotManager.use(new Cache(createConfig<MemoryCacheOptions>({
      slot: 'MemoryCache',
    })));

    Tree.setWebTrunk(globalSlots);

    const app = new WebApplication();
    const router = new WebRouter({
      slots: globalSlots.use(new SlotDemo1('123')),
    });
    app.appendRoutes(router);
    server = request(app.listen());

    router
      .get('/')
      .action((ctx) => {
        ctx.send(ctx.testData);
      });

    await server.get('/').expect('123');
  });

  it ('can use action slots', async () => {
    router
      .get('/')
      .use(new SlotDemo1('456'))
      .action((ctx) => {
        ctx.send(ctx.testData);
      });

    await server.get('/').expect('456');
  });
});
