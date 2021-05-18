import { writeFileSync } from 'fs';
import { generateRouterSchemas } from '../../src';

const input = './test/fixture/router-schema/';

it('generate snapshot', async () => {
  const schemas = await generateRouterSchemas(input);
  writeFileSync(
    input + 'snapshot-formatted.json',
    JSON.stringify(schemas, null, 2),
  );
});

it('can export web routers', async () => {
  expect(
    JSON.stringify(await generateRouterSchemas(input), null, 4),
  ).toMatchSnapshot();
});
