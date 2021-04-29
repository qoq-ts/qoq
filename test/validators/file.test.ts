import request from 'supertest';
import path from 'path';
import { readFileSync } from 'fs';
import { WebApplication, validator, WebRouter, WebSlotManager } from '../../src';
import { createHash } from 'crypto';
import { Server } from 'node:http';

describe('File validator', () => {
  const app = new WebApplication();
  let listen: Server;

  const router = new WebRouter({
    slots: WebSlotManager.use(null),
  });

  beforeEach(() => {
    listen = app.listen();
  });

  afterEach(() => {
    listen.close();
  });

  router
    .post('/a')
    .body({
      file1: validator.file,
    })
    .action((ctx, payload) => {
      ctx.body = payload.body;
    });

  router
    .post('/b')
    .body({
      file1: validator.file.multiples(),
    })
    .action((ctx, payload) => {
      ctx.body = payload.body;
    });

  router
    .post('/c')
    .body({
      file1: validator.file.maxSize(300).hash('md5').allowMimeTypes(['image/png', 'image/gif']),
    })
    .action((ctx, payload) => {
      ctx.body = payload.body;
    });

  app.mountRouter(router);

  it ('may be undefined', async () => {
    expect(await validator.file.optional().validate({}, 'any')).toEqual(undefined);
  });

  it ('can upload single file', async () => {
    await request(listen)
      .post('/a')
      .attach('file1', path.join(__dirname, '..', 'fixture', 'favicon.png'))
      .then((res) => {
        expect(res.body.file1).toMatchObject({
          name: 'favicon.png',
          type: 'image/png',
        });
      });

    await request(listen)
      .post('/a')
      .attach('file1', path.join(__dirname, '..', 'fixture', 'favicon.png'))
      .attach('file1', path.join(__dirname, '..', 'fixture', 'arrow.png'))
      .then((res) => {
        expect(res.body.file1).toMatchObject({
          name: 'favicon.png',
          type: 'image/png',
        });
      });

    listen.close();
  });

  it ('can upload multiple file', async () => {
    const router = new WebRouter({
      slots: WebSlotManager.use(null),
    });

    router
      .post('/b')
      .body({
        file1: validator.file.multiples(),
      })
      .action((ctx, payload) => {
        ctx.body = payload.body;
      });

    app.mountRouter(router);

    await request(listen)
      .post('/b')
      .attach('file1', path.join(__dirname, '..', 'fixture', 'favicon.png'))
      .then((res) => {
        expect(res.body.file1).toHaveLength(1);
        expect(res.body.file1[0]).toMatchObject({
          name: 'favicon.png',
          type: 'image/png',
        });
      });

    await request(listen)
      .post('/b')
      .attach('file1', path.join(__dirname, '..', 'fixture', 'favicon.png'))
      .attach('file1', path.join(__dirname, '..', 'fixture', 'arrow.png'))
      .then((res) => {
        expect(res.body.file1).toHaveLength(2);
        expect(res.body.file1[0]).toMatchObject({
          name: 'favicon.png',
          type: 'image/png',
        });
        expect(res.body.file1[1]).toMatchObject({
          name: 'arrow.png',
          type: 'image/png',
        });
      });

    listen.close();
  });

  it ('can set max size', async () => {
    await request(listen)
      .post('/c')
      .attach('file1', path.join(__dirname, '..', 'fixture', 'favicon.png'))
      .expect(400)
      .then((res) => {
        expect(res.text).toContain('300B');
      });

    await request(listen)
      .post('/c')
      .attach('file1', path.join(__dirname, '..', 'fixture', 'arrow.png'))
      .expect(200);
  });

  it ('can set hash', async () => {
    await request(listen)
      .post('/c')
      .attach('file1', path.join(__dirname, '..', 'fixture', 'arrow.png'))
      .then((res) => {
        expect(res.body.file1).toMatchObject({
          hash: createHash('md5')
            .update(readFileSync(path.join(__dirname, '..', 'fixture', 'arrow.png')))
            .digest('hex'),
        });
      });
  });

  it ('can set allow types', async () => {
    await request(listen)
      .post('/c')
      .attach('file1', path.join(__dirname, '..', 'fixture', 'arrow.jpg'))
      .expect(400)
      .then((res) => {
        expect(res.text).toContain('mime type');
      });
  });
});
