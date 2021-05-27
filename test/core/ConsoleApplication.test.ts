import path, { dirname } from 'path';
import { jest } from '@jest/globals';
import { ConsoleApplication } from '../../src';
import { getDirName } from '../../src/util/getDirName';

it('can execute command', async () => {
  const app = new ConsoleApplication({
    commandsDir: path.join(dirname(getDirName(import.meta.url)), 'fixture'),
  });

  const ctx = await app.execute('/test3');
  expect(ctx.state).toMatchObject({
    data: 'Hello router3',
  });
});

it('can mount commands', async () => {
  const app = new ConsoleApplication();
  const spy = jest.spyOn(console, 'log');
  let message = '';

  spy.mockImplementation((msg) => {
    message += msg;
  });

  await app.execute('-h');
  expect(message).not.toContain('test3');

  message = '';
  app.mountCommandPath(path.join(dirname(getDirName(import.meta.url)), 'fixture'));
  await app.execute('-h');
  expect(message).toContain('test3');

  spy.mockRestore();
});
