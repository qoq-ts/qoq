import path, { dirname } from 'path';
import { ConsoleApplication } from '../../src';

it ('can execute command', async () => {
  const app = new ConsoleApplication({
    commandsDir: path.join(dirname(__dirname), 'fixture'),
  });

  const ctx = await app.execute('/test3');
  expect(ctx.state).toMatchObject({
    data: 'Hello router3',
  });
});

it ('can mount commands', async () => {
  const app = new ConsoleApplication();
  const spy = jest.spyOn(console, 'log');
  let message = '';

  spy.mockImplementation((msg) => {
    message += msg;
  });

  await app.execute('-h');
  expect(message).not.toContain('test3');

  message = '';
  app.mountCommandPath(path.join(dirname(__dirname), 'fixture'));
  await app.execute('-h');
  expect(message).toContain('test3');

  spy.mockRestore();
});
