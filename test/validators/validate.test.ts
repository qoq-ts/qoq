import { validator } from '../../src';

test('validate object', async () => {
  let data = await validator.validate(
    { hello: 'world', age: 3 },
    {
      hello: validator.string,
      age: validator.string,
    },
  );

  expect(data).toMatchObject({
    hello: 'world',
    age: '3',
  });

  expect(data).not.toMatchObject({
    hello: 'world',
    age: 3,
  });
});

test('validate function will throw error', async () => {
  await expect(
    validator.validate(
      { age: 3 },
      {
        hello: validator.string,
        age: validator.string,
      },
    ),
  ).rejects.toThrow('hello is required');
});
