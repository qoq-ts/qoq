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
  try {
    await validator.validate(
      { age: 3 },
      {
        hello: validator.string,
        age: validator.string,
      },
    );
    expect(true).toBeFalsy();
  } catch (e) {
    expect(e.message).toBe('hello is required');
  }
});
