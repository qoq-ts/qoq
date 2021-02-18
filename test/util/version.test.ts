import { version } from '../../src';

describe('version', () => {
  it ('test version is string', () => {
    expect(typeof version).toEqual('string');
  });

  it ('looks like x.y.z', () => {
    expect(/^\d+\.\d+\.\d+/.test(version)).toBeTruthy();
  });
});
