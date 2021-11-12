import { Tree, validator, WebApplication, WebRouter, WebSlotManager } from '../../src';
import request from 'supertest';
import { SlotDemo1 } from '../fixture/SlotDemo1';
import { resolve } from 'path';
import { Server } from 'http';

let app: WebApplication;
let listen: Server;
let router: WebRouter<{}, {}>;
let server: ReturnType<typeof request>;

beforeEach(() => {
  app = new WebApplication();
  router = new WebRouter({
    slots: new WebSlotManager(),
  });
  app.mountRouter(router);
  listen = app.listen();
  server = request(listen);
});

afterEach(() => {
  listen.close();
});

it('should respond 404 without router', async () => {
  await server.get('/').expect(404);
});

it('can create router with method get + query', async () => {
  router
    .get('/')
    .query({
      name: validator.string.default('World'),
    })
    .action(async (ctx, payload) => {
      ctx.body = 'Hello ' + payload.query.name;
    });

  await server.head('/').expect(200);
  await server.get('/').expect('Hello World').expect(200);
  await server.get('/?name=Google').expect('Hello Google').expect(200);
});

it('can create router with method post + payload', async () => {
  router
    .post('/user')
    .body({
      name: validator.string,
      age: validator.number,
    })
    .action(async (ctx, payload) => {
      ctx.body = {
        name: payload.body.name,
        age: payload.body.age,
      };
      ctx.status = 201;
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

  await server.post('/user').send({}).expect(400);
});

it('can upload file', async () => {
  router
    .post('/avatar')
    .body({
      file: validator.file,
      ping: validator.string,
    })
    .action(async (ctx, payload) => {
      ctx.body = {
        filename: payload.body.file.originalFilename,
        ping: payload.body.ping,
      };
    });

  await server
    .post('/avatar')
    .field('ping', 'pong')
    .attach('file', resolve('./test/fixture/hello.txt'))
    .expect({
      filename: 'hello.txt',
      ping: 'pong',
    });
});

it('can create router with method put', async () => {
  router
    .put('/user/:id')
    .params({
      id: validator.number,
    })
    .body({
      name: validator.string,
      age: validator.number,
    })
    .action(async (ctx, payload) => {
      ctx.body = {
        id: payload.params.id,
        name: payload.body.name,
        age: payload.body.age,
      };

      ctx.status = 202;
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

it('can create router with method patch', async () => {
  router
    .patch('/user/:id')
    .params({
      id: validator.number,
    })
    .body({
      name: validator.string.optional(),
      age: validator.number.optional(),
    })
    .action(async (ctx, payload) => {
      ctx.body = {
        id: payload.params.id,
        name: payload.body.name,
        age: payload.body.age,
      };
      ctx.status = 202;
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

it('can create router with method delete', async () => {
  router
    .delete('/user/:id')
    .params({
      id: validator.number,
    })
    .action(async (ctx) => {
      ctx.status = 204;
    });

  await server.delete('/user/1').expect(204);
});

it('can create router with all methods', async () => {
  router.all('/hello').action(async (ctx) => {
    ctx.body = 'Hello World';
  });

  await server.head('/hello').expect(200);
  await server.get('/hello').expect('Hello World').expect(200);
  await server.post('/hello').expect('Hello World').expect(200);
  await server.put('/hello').expect('Hello World').expect(200);
  await server.patch('/hello').expect('Hello World').expect(200);
  await server.delete('/hello').expect('Hello World').expect(200);
});

it('will respond 404 when method not matched', async () => {
  router.get('/').action(async (ctx) => {
    ctx.body = 'Hello';
  });

  await server.post('/').expect(404);
  await server.put('/').expect(404);
});

it('will respond 404 when url not matched', async () => {
  router.get('/').action(async (ctx) => {
    ctx.body = 'Hello';
  });

  await server.get('/hello').expect(404);
});

it('can parse complex params', async () => {
  router.get(['/(admin|a)', '/adm', '/ada']).action(async (ctx) => {
    ctx.body = 'Hello: Admin';
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
    .action(async (ctx, payload) => {
      ctx.body = 'Hello: ' + payload.params.id;
    });

  router
    .get('/users-:name')
    .params({
      name: validator.string,
    })
    .action(async (ctx, payload) => {
      ctx.body = 'Hi: ' + payload.params.name;
    });

  await server.get('/users').expect('Hello: 10');
  await server.get('/users/20').expect('Hello: 20');
  await server.get('/users-bob').expect('Hi: bob');
});

it('can use group slots', async () => {
  const globalSlots = WebSlotManager.use(new SlotDemo1('567'));

  Tree.trunk(globalSlots);

  const app = new WebApplication();
  const router = new WebRouter({
    slots: globalSlots.use(new SlotDemo1('123')),
  });
  const listen = app.listen();
  app.mountRouter(router);
  server = request(listen);

  router.get('/').action((ctx) => {
    ctx.body = ctx.testData;
  });

  await server.get('/').expect(200).expect('123');

  listen.close();
});

it('can use action slots', async () => {
  router
    .get('/')
    .use(new SlotDemo1('456'))
    .action((ctx) => {
      ctx.body = ctx.testData;
    });

  await server.get('/').expect('456');
});

it('can use router prefix', async () => {
  router = new WebRouter({
    prefix: '/',
    slots: new WebSlotManager(),
  });
  app.mountRouter(router);

  router.get('/').action((ctx) => {
    ctx.body = 'ok';
  });

  router.get('/ping').action((ctx) => {
    ctx.body = 'ok';
  });

  const router1 = new WebRouter({
    prefix: '/users',
    slots: new WebSlotManager(),
  });

  app.mountRouter(router1);
  router1.get('/').action((ctx) => {
    ctx.body = 'ok';
  });

  router1.get('/ping').action((ctx) => {
    ctx.body = 'ok';
  });

  await server.get('/').expect(200);
  await server.get('/ping').expect(200);
  await server.get('/ping/').expect(200);
  await server.get('/users').expect(200);
  await server.get('/users/ping').expect(200);
  await server.get('/users/ping/').expect(200);
});

it('should respond 404 when path with params is invalid', async () => {
  router
    .get('/test/:id')
    .params({
      id: validator.number,
    })
    .action((ctx) => {
      ctx.body = 'ok';
    });

  router
    .get('/test2/:name')
    .params({
      name: validator.string,
    })
    .action((ctx) => {
      ctx.body = 'ok';
    });

  await server.get('/test/:id').expect(400);
  await server.get('/test/20').expect(200);

  await server.get('/test2/:name').expect(200);
  await server.get('/test2/20').expect(200);
});

it('can receive array parameter in querystring', async () => {
  const app = new WebApplication();
  const router = new WebRouter({
    slots: null,
  });
  const listen = app.listen();
  app.mountRouter(router);
  server = request(listen);

  router
    .get('/')
    .query({
      list: validator.array.items(validator.number),
    })
    .action((ctx, payload) => {
      ctx.body = payload.query.list.toString();
    });

  await request(listen).get('/?list=1&list=2&list=3&list=4').expect(200).expect('1,2,3,4');

  await request(listen).get('/?list[]=1&list[]=2&list[]=3&list[]=4').expect(200).expect('1,2,3,4');

  await request(listen).get('/?list[]=1&list[]=2&list=3&list[]=4').expect(200).expect('1,2,4,3');

  await request(listen)
    .get('/?list[0]=1&list[1]=2&list[2]=3&list[3]=4')
    .expect(200)
    .expect('1,2,3,4');

  listen.close();
});
