import { readFileSync } from 'fs';
import { tmpdir } from 'os';
import { ConsoleApplication } from '../../src';

const app = new ConsoleApplication({
  commandsDir: './src/command',
});

const input = './test/fixture/router-schema';

it.skip ('generate snapshot', async () => {
  await app.execute(
    'export:routers',
    '-i', input,
    '-o', input + '/snapshot.json',
  );

  await app.execute(
    'export:routers',
    '-i', input,
    '-o', input + '/snapshot-formatted.json',
    '-f'
  );
});

it ('can export web routers to file', async () => {
  const output = tmpdir() + '/snapshot.json';

  await app.execute(
    'export:routers',
    '-i', input,
    '-o', output,
  );

  expect(readFileSync(output).toString()).toBe(readFileSync(input + '/snapshot.json').toString());
});


it ('can export web routers to context', async () => {
  const output = tmpdir() + '/snapshot.json';

  const ctx = await app.execute(
    'export:routers',
    '-i', input,
    '-o', output,
  );

  // @ts-expect-error
  const data = JSON.stringify(ctx.state.routers);
  expect(data).toBe(readFileSync(input + '/snapshot.json').toString());
});

it ('can format output json', async () => {
  const output = tmpdir() + '/snapshot.json';

  await app.execute(
    'export:routers',
    '-i', input,
    '-o', output,
    '-f'
  );

  expect(readFileSync(output).toString()).toBe(readFileSync(input + '/snapshot-formatted.json').toString());
});
