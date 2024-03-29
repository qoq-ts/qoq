import request from 'supertest';
import path, { dirname } from 'path';
import { readFileSync } from 'fs';
import { WebApplication, validator, WebRouter } from '../../src';
import { createHash } from 'crypto';
import { Server } from 'http';
import { createContext } from 'this-file';

const __dir = createContext().dirname;

describe('File validator', () => {
  const app = new WebApplication();
  let listen: Server;

  const router = new WebRouter({
    slots: null,
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

  it('may be undefined', async () => {
    expect(await validator.file.optional().validate({}, 'any')).toBeUndefined();
  });

  it('can upload single file', async () => {
    await request(listen)
      .post('/a')
      .attach('file1', path.join(dirname(__dir), 'fixture', 'favicon.png'))
      .then((res) => {
        expect(res.body.file1).toMatchObject({
          originalFilename: 'favicon.png',
          mimetype: 'image/png',
          size: 540,
        });
      });

    await request(listen)
      .post('/a')
      .attach('file1', path.join(dirname(__dir), 'fixture', 'favicon.png'))
      .attach('file1', path.join(dirname(__dir), 'fixture', 'arrow.png'))
      .then((res) => {
        expect(res.body.file1).toMatchObject({
          originalFilename: 'favicon.png',
          mimetype: 'image/png',
        });
      });

    listen.close();
  });

  it('can upload multiple file', async () => {
    const router = new WebRouter({
      slots: null,
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
      .attach('file1', path.join(dirname(__dir), 'fixture', 'favicon.png'))
      .then((res) => {
        expect(res.body.file1).toHaveLength(1);
        expect(res.body.file1[0]).toMatchObject({
          originalFilename: 'favicon.png',
          mimetype: 'image/png',
        });
      });

    await request(listen)
      .post('/b')
      .attach('file1', path.join(dirname(__dir), 'fixture', 'favicon.png'))
      .attach('file1', path.join(dirname(__dir), 'fixture', 'arrow.png'))
      .then((res) => {
        expect(res.body.file1).toHaveLength(2);
        expect(res.body.file1[0]).toMatchObject({
          originalFilename: 'favicon.png',
          mimetype: 'image/png',
        });
        expect(res.body.file1[1]).toMatchObject({
          originalFilename: 'arrow.png',
          mimetype: 'image/png',
        });
      });

    listen.close();
  });

  it('can set max size', async () => {
    await request(listen)
      .post('/c')
      .attach('file1', path.join(dirname(__dir), 'fixture', 'favicon.png'))
      .expect(400)
      .then((res) => {
        expect(res.text).toContain('300B');
      });

    await request(listen)
      .post('/c')
      .attach('file1', path.join(dirname(__dir), 'fixture', 'arrow.png'))
      .expect(200);
  });

  it('can set hash', async () => {
    await request(listen)
      .post('/c')
      .attach('file1', path.join(dirname(__dir), 'fixture', 'arrow.png'))
      .then((res) => {
        expect(res.body.file1).toMatchObject({
          hash: createHash('md5')
            .update(readFileSync(path.join(dirname(__dir), 'fixture', 'arrow.png')))
            .digest('hex'),
        });
      });
  });

  it('can set allow types', async () => {
    await request(listen)
      .post('/c')
      .attach('file1', path.join(dirname(__dir), 'fixture', 'arrow.jpg'))
      .expect(400)
      .then((res) => {
        expect(res.text).toContain('mime type');
      });
  });
});
