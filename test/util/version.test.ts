import { expect } from 'chai';
import { version } from '../../src';

describe('version', () => {
  it ('test version is string', () => {
    expect(typeof version).to.equal('string');
  });

  it ('looks like x.y.z', () => {
    expect(/^\d+\.\d+\.\d+/.test(version)).to.be.true;
  });
});
