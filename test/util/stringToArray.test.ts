import { expect } from 'chai';
import { stringToArray } from '../../src/util/stringToArray';

describe('basic to array', () => {
  it ('convert string to array', () => {
    expect(stringToArray('hello')).to.have.length(1);
    expect(stringToArray('hello')).to.have.contain('hello');
  });

  it ('does not change original array', () => {
    const arr = ['hello'];
    expect(stringToArray(arr)).to.equal(arr);
  });
});
