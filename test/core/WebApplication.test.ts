import path, { dirname } from 'path';
import { WebApplication, WebRouter, WebSlotManager } from '../../src';
import request from 'supertest';
import { createContext } from 'this-file';

const __dir = createContext().dirname;

it('can search routers', async () => {
  const app = new WebApplication({
    routersDir: path.join(dirname(__dir), 'fixture'),
  });
  const listener = app.listen();

  await app.ready();
  await request(listener).get('/test1').expect('Hello router1');
  await request(listener).get('/test2').expect('Hello router2');

  listener.close();
});

it('can mount router from memory', async () => {
  const app = new WebApplication({
    routersDir: path.join(dirname(__dir), 'fixture'),
  });
  const router = new WebRouter({
    slots: new WebSlotManager(),
  });
  router.get('/hello').action((ctx) => (ctx.body = 'World'));
  app.mountRouter([router]);

  const listener = app.listen();

  await app.ready();
  await request(listener).get('/test1').expect('Hello router1');
  await request(listener).get('/hello').expect('World');

  listener.close();
});

it('can mount router path after app is created', async () => {
  const app = new WebApplication({
    routersDir: [],
  });
  const listener = app.listen();

  await app.ready();
  await request(listener).get('/test1').expect(404);

  await app.mountRouterPath(path.join(dirname(__dir), 'fixture'));
  await request(listener).get('/test1').expect('Hello router1');

  listener.close();
});

it('mount router path before ready() is allowed', async () => {
  const app = new WebApplication({
    routersDir: './not-exists',
  });
  const listener = app.listen();
  app.mountRouterPath(path.join(dirname(__dir), 'fixture'));

  await app.ready();
  await request(listener).get('/test1').expect('Hello router1');

  listener.close();
});

it('only search WebRouter', async () => {
  const app = new WebApplication({
    routersDir: path.join(dirname(__dir), 'fixture'),
  });
  const listener = app.listen();
  await request(listener).get('/test3').expect(404);
  listener.close();
});

it('router can use `export default`', async () => {
  const app = new WebApplication({
    routersDir: path.join(dirname(__dir), 'fixture'),
  });
  const listener = app.listen();

  await app.ready();
  await request(listener).get('/test4').expect('Hello router4');
  listener.close();
});
