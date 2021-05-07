
import { validator } from '../../src';
import { cloneDeep } from 'lodash';

const defaultData = {
  http: 'http://example.com',
  https: 'https://www.example.com',
  port: 'http://example.com:3000',
  path: 'https://www.example.com/a/b',
  portPath: 'http://example.com:3000/a/b',
  ftp: 'ftp://www.example.com/a/b',
  invalid: '//example.com',
};

describe('Url validator', () => {
  let data: typeof defaultData;

  beforeEach(() => {
    data = cloneDeep(defaultData);
  });

  it ('should support many kinds', async () => {
    expect(await validator.url.validate(data, 'http')).toEqual(undefined);
    expect(await validator.url.validate(data, 'https')).toEqual(undefined);
    expect(await validator.url.validate(data, 'port')).toEqual(undefined);
    expect(await validator.url.validate(data, 'path')).toEqual(undefined);
    expect(await validator.url.validate(data, 'portPath')).toEqual(undefined);

    expect(await validator.url.validate(data, 'invalid')).toContain('must be url');
  });

  it ('may be undefined', async () => {
    expect(await validator.url.optional().validate(data, 'notfound')).toEqual(undefined);
    expect(await validator.url.validate(data, 'notfound')).toContain('is required');
  });

  it ('should has default value', async () => {
    const newlyData: Record<string, any> = {};

    await validator.url.default(data.https).validate(newlyData, 'hello');
    expect(newlyData['hello']).toEqual(data.https);
  });

  it ('should have multiple schemes', async () => {
    expect(await validator.url.validate(data, 'ftp')).toContain('scheme');
    expect(await validator.url.schemes(['ftp', 'http', 'https']).validate(data, 'ftp')).toEqual(undefined);
  });

  it ('can transform data by user', async () => {
    const msg = await validator
      .url
      .transform((value) => value.substr(5))
      .validate(data, 'http');

    expect(msg).toBeUndefined();

    expect(data['http']).toEqual('//example.com');
  });
});
