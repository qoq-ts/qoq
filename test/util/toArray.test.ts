import { expect } from 'chai';
import { toArray } from '../../src/util/toArray';

describe('basic to array', () => {
  it ('convert string to array', () => {
    expect(toArray('hello')).to.have.length(1);
    expect(toArray('hello')).to.have.contain('hello');
  });

  it ('does not change original array', () => {
    const arr = ['hello'];
    expect(toArray(arr)).to.equal(arr);
  });
});
