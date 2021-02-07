import { expect } from 'chai';
import { getMimeType } from '../../src/util/getMimeType';

describe('get mime type', () => {
  it ('can get json type', () => {
    expect(getMimeType('json')).to.equal('application/json; charset=utf-8');
    expect(getMimeType('application/json')).to.equal('application/json; charset=utf-8');
  });

  it ('can get html type', () => {
    expect(getMimeType('html')).to.equal('text/html; charset=utf-8');
    expect(getMimeType('text/html')).to.equal('text/html; charset=utf-8');
  });

  it ('can get xml type', () => {
    expect(getMimeType('xml')).to.equal('application/xml');
    expect(getMimeType('application/xml')).to.equal('application/xml');
  });

  it ('can get unknown type', () => {
    expect(getMimeType('unknown')).to.equal('unknown');
  });

  it ('can cache type', () => {
    expect(getMimeType('html')).to.equal('text/html; charset=utf-8');
    expect(getMimeType('html')).to.equal('text/html; charset=utf-8');
  });
});
