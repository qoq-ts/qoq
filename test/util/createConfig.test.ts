import { createConfig } from '../../src';

describe('create config', () => {
  it ('return data is input data', () => {
    const data = { hello: 'world' };

    expect(createConfig<{ hello: string }>(data)).toEqual(data);
    // @ts-expect-error
    expect(createConfig<{ hi: number }>(data)).toEqual(data);
  });
});
