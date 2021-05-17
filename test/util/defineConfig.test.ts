import { defineConfig } from '../../src';

describe('create config', () => {
  it('return data is input data', () => {
    const data = { hello: 'world' };

    expect(defineConfig<{ hello: string }>(data)).toEqual(data);
    // @ts-expect-error
    expect(defineConfig<{ hi: number }>(data)).toEqual(data);
  });
});
