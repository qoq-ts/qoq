import { validate, validator } from '../../src';

test('validate object', async () => {
  let data = await validate({ hello: 'world', age: 3 }, {
    hello: validator.string,
    age: validator.string,
  });

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
    await validate({ age: 3 }, {
      hello: validator.string,
      age: validator.string,
    });
    expect(true).toBeFalsy();
  } catch (e) {
    expect(e.message).toBe('hello is required');
  }
});
