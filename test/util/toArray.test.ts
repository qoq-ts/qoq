import { toArray } from '../../src/util/toArray';

describe('basic to array', () => {
  it('convert string to array', () => {
    expect(toArray('hello')).toHaveLength(1);
    expect(toArray('hello')).toContain('hello');
  });

  it('does not change original array', () => {
    const arr = ['hello'];
    expect(toArray(arr)).toEqual(arr);
  });
});
