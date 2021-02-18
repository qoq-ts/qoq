import { getMimeType } from '../../src/util/getMimeType';

describe('get mime type', () => {
  it ('can get json type', () => {
    expect(getMimeType('json')).toEqual('application/json; charset=utf-8');
    expect(getMimeType('application/json')).toEqual('application/json; charset=utf-8');
  });

  it ('can get html type', () => {
    expect(getMimeType('html')).toEqual('text/html; charset=utf-8');
    expect(getMimeType('text/html')).toEqual('text/html; charset=utf-8');
  });

  it ('can get xml type', () => {
    expect(getMimeType('xml')).toEqual('application/xml');
    expect(getMimeType('application/xml')).toEqual('application/xml');
  });

  it ('can get unknown type', () => {
    expect(getMimeType('unknown')).toEqual('unknown');
  });

  it ('can cache type', () => {
    expect(getMimeType('html')).toEqual('text/html; charset=utf-8');
    expect(getMimeType('html')).toEqual('text/html; charset=utf-8');
  });
});
