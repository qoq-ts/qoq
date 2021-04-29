import { validator } from '../../src';

test ('the valid emails', () => {
  const data = {
    email1: 'hello@abc.com',
    email2: 'hi-test@ccc.com.cc',
  };

  expect(validator.email.optional().validate(data, 'notfound')).toEqual(undefined);
  expect(validator.email.validate(data, 'email1')).toEqual(undefined);
  expect(validator.email.validate(data, 'email2')).toEqual(undefined);
});

test ('the invalid emails', () => {
  const data = {
    email1: 'hello@abc',
    email2: 'hi-test#ccc.com.cc',
    email3: 'hi-test@ccc.com.',
  };

  expect(validator.email.validate(data, 'notfound')).toContain('required');
  expect(validator.email.validate(data, 'email1')).toContain('email');
  expect(validator.email.validate(data, 'email2')).toContain('email');
  expect(validator.email.validate(data, 'email3')).toContain('email');
});
