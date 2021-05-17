import { validator } from '../../src';
import { cloneDeep } from 'lodash';

const defaultData = {
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
    },
  },
  objDataStr: '{"hello":"world"}',
};

describe('Json validator', () => {
  let data: typeof defaultData;

  beforeEach(() => {
    data = cloneDeep(defaultData);
  });

  it('may be undefined', async () => {
    expect(
      await validator.json.properties(data.objPlain).validate(data, 'objPlain'),
    ).toBeUndefined();
    expect(
      await validator.json.optional().validate(data, 'notfound'),
    ).toBeUndefined();
    expect(await validator.json.validate(data, 'notfound')).toContain(
      'is required',
    );
  });

  it('should has default value', async () => {
    const newlyData: Record<string, any> = {};

    expect(
      await validator.json
        .default({ hello: 'world' })
        .validate(newlyData, 'id2'),
    ).toBeUndefined();
    expect(newlyData['id2']).toMatchObject({ hello: 'world' });
  });

  it('should hit constraint', async () => {
    expect(
      await validator.json
        .properties({
          hello: validator.string,
          hi: validator.json.properties({
            man: validator.number,
            woman: validator.number,
          }),
        })
        .validate(data, 'objPlain'),
    ).toContain('is required');

    expect(
      await validator.json
        .properties({
          hello: validator.string,
          hi: validator.json.properties({
            man: validator.number,
            woman: validator.number,
            list: validator.array.items(validator.string),
          }),
        })
        .validate(data, 'objData'),
    ).toBeUndefined();
  });

  it('json string can be convert to json object', async () => {
    expect(
      await validator.json
        .properties({
          hello: validator.string,
        })
        .validate(data, 'objDataStr'),
    ).toBeUndefined();

    expect(
      await validator.json
        .properties({
          hello: validator.string,
        })
        .validate(data, 'id2'),
    ).toContain('must be json');

    expect(
      await validator.json
        .properties({
          hello: validator.string,
        })
        .validate(data, 'invalidStr'),
    ).toContain('must be json');

    expect(
      await validator.json
        .properties({
          hello: validator.string,
        })
        .validate(data, 'arrayStr'),
    ).toContain('must be json');
  });

  it('should support nested keys', async () => {
    expect(
      await validator.json
        .properties({
          hi: validator.json.properties({
            foo: validator.number,
          }),
        })
        .validate(data, 'objData'),
    ).toContain('hi.foo');
  });

  it('can transform data by user', async () => {
    await validator.json
      .properties({
        hello: validator.string,
      })
      .transform(Object.values)
      .validate(data, 'objData');

    expect(data['objData']).toEqual(['world']);
  });
});
