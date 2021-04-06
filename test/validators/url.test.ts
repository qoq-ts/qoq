
import { validator } from '../../src';


describe('Url validator', () => {
  let data: Record<string, any> = {};

  beforeEach(() => {
    data = {
      http: 'http://example.com',
      https: 'https://www.example.com',
      port: 'http://example.com:3000',
      path: 'https://www.example.com/a/b',
      portPath: 'http://example.com:3000/a/b',
      ftp: 'ftp://www.example.com/a/b',
      invalid: '//example.com',
    };
  });

  it ('should support many kinds', () => {
    expect(validator.url.validate(data, 'http')).toEqual(undefined);
    expect(validator.url.validate(data, 'https')).toEqual(undefined);
    expect(validator.url.validate(data, 'port')).toEqual(undefined);
    expect(validator.url.validate(data, 'path')).toEqual(undefined);
    expect(validator.url.validate(data, 'portPath')).toEqual(undefined);

    expect(validator.url.validate(data, 'invalid')).toContain('must be url');
  });

  it ('may be undefined', () => {
    expect(validator.url.optional().validate(data, 'notfound')).toEqual(undefined);
    expect(validator.url.validate(data, 'notfound')).toContain('is required');
  });

  it ('should has default value', () => {
    const newlyData: Record<string, any> = {};

    validator.url.default(data.https).validate(newlyData, 'hello');
    expect(newlyData['hello']).toEqual(data.https);
  });

  it ('should have multiple schemes', () => {
    expect(validator.url.validate(data, 'ftp')).toContain('must be url');
    expect(validator.url.schemes(['ftp', 'http', 'https']).validate(data, 'ftp')).toEqual(undefined);
  });
});
