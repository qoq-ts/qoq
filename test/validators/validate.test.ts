import { validate, validator } from '../../src';

test('validate object', () => {
  let data = validate({ hello: 'world', age: 3 }, {
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

test('validate function will throw error', () => {
  expect(() => validate({ age: 3 }, {
    hello: validator.string,
    age: validator.string,
  })).toThrowError('hello is required');
});
