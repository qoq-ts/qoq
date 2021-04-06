
import { validator } from '../../src';


describe('Json validator', () => {
  let data: Record<string, any> = {};

  beforeEach(() => {
    data = {
      id2: 2,
      invalidStr: '2222333[]',
      arrayStr: '["2", "3"]',
      objPlain: {},
      objPlainStr: '{}',
      objData: {
        hello: 'world',
        hi: {
          man: 1,
          woman: 2,
          list: [1, 2],
        }
      },
      objDataStr: '{"hello":"world"}'
    };
  });

  it ('may be undefined', () => {
    expect(validator.json.constraint(data.objPlain).validate(data, 'objPlain')).toEqual(undefined);
    expect(validator.json.optional().validate(data, 'notfound')).toEqual(undefined);
    expect(validator.json.validate(data, 'notfound')).toContain('is required');
  });

  it ('should has default value', () => {
    const newlyData: Record<string, any> = {};

    expect(validator.json.default({ hello: 'world' }).validate(newlyData, 'id2')).toEqual(undefined);
    expect(newlyData['id2']).toMatchObject({ hello: 'world' });
  });

  it ('should hit constraint', () => {
    expect(validator.json.constraint({
      hello: validator.string,
      hi: validator.json.constraint({
        man: validator.number,
        woman: validator.number,
      }),
    }).validate(data, 'objPlain')).toContain('is required');

    expect(validator.json.constraint({
      hello: validator.string,
      hi: validator.json.constraint({
        man: validator.number,
        woman: validator.number,
        list: validator.array.each(validator.string),
      }),
    }).validate(data, 'objData')).toEqual(undefined);
  });

  it ('json string can be convert to json object', () => {
    expect(validator.json.constraint({
      hello: validator.string,
    }).validate(data, 'objDataStr')).toEqual(undefined);

    expect(validator.json.constraint({
      hello: validator.string,
    }).validate(data, 'id2')).toContain('must be json');

    expect(validator.json.constraint({
      hello: validator.string,
    }).validate(data, 'invalidStr')).toContain('must be json');

    expect(validator.json.constraint({
      hello: validator.string,
    }).validate(data, 'arrayStr')).toContain('must be json');
  });

  it ('should support nested keys', () => {
    expect(validator.json.constraint({
      hi: validator.json.constraint({
        foo: validator.number,
      }),
    }).validate(data, 'objData')).toContain('hi.foo');
  });
});
