import { validator } from '../../src';

test('the valid emails', async () => {
  const data = {
    email1: 'hello@abc.com',
    email2: 'hi-test@ccc.com.cc',
  };

  expect(await validator.email.optional().validate(data, 'notfound')).toEqual(
    undefined,
  );
  expect(await validator.email.validate(data, 'email1')).toEqual(undefined);
  expect(await validator.email.validate(data, 'email2')).toEqual(undefined);
});

test('the invalid emails', async () => {
  const data = {
    email1: 'hello@abc',
    email2: 'hi-test#ccc.com.cc',
    email3: 'hi-test@ccc.com.',
  };

  expect(await validator.email.validate(data, 'notfound')).toContain(
    'required',
  );
  expect(await validator.email.validate(data, 'email1')).toContain('email');
  expect(await validator.email.validate(data, 'email2')).toContain('email');
  expect(await validator.email.validate(data, 'email3')).toContain('email');
});
