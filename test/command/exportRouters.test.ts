import { existsSync, readFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { ConsoleApplication } from '../../src';

const app = new ConsoleApplication({
  commandsDir: './src/command',
});

const input = './test/fixture/router-schema';

it ('generate snapshot', async () => {
  try {
    unlinkSync(input + '/snapshot-formatted.json');
  } catch {}
  expect(existsSync(input + '/snapshot-formatted.json')).toBeFalsy();

  await app.execute(
    'export:routers',
    '-i', input,
    '-o', input + '/snapshot-formatted.json',
    '-f'
  );

  expect(existsSync(input + '/snapshot-formatted.json')).toBeTruthy();
});

it ('can export web routers to file', async () => {
  const output = tmpdir() + '/snapshot.json';

  await app.execute(
    'export:routers',
    '-i', input,
    '-o', output,
  );

  expect(readFileSync(output).toString()).toMatchSnapshot();
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
  expect(data).toMatchSnapshot();
});

it ('can format output json', async () => {
  const output = tmpdir() + '/snapshot.json';

  await app.execute(
    'export:routers',
    '-i', input,
    '-o', output,
    '-f'
  );

  expect(readFileSync(output).toString()).toMatchSnapshot();
});
