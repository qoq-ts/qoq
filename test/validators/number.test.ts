
import { validator } from '../../src';
import { cloneDeep } from 'lodash';

const defaultData = {
  id2: 2,
  id2str: '2',
  age2: 2,
  age10: 10,
  age20: 20,
  age20str: '20',
  age20_1: 20.1,
  nan: '2hello',
  float3: 20.333,
  float10: 2e-10,
  float12: 2.15e-10,
};

describe('Number validator', () => {
  let data: typeof defaultData;

  beforeEach(() => {
    data = cloneDeep(defaultData);
  });

  it ('may be undefined', async () => {
    expect(await validator.number.validate(data, 'id2')).toEqual(undefined);
    expect(await validator.number.optional().validate(data, 'notfound')).toEqual(undefined);
    expect(await validator.number.validate(data, 'notfound')).toContain('is required');
  });

  it ('should has default value', async () => {
    const newlyData: Record<string, any> = {};

    await validator.number.default(15).validate(newlyData, 'id2');
    expect(newlyData['id2']).toEqual(15);
  });

  it ('support integer only', async () => {
    expect(await validator.number.onlyInteger().validate(data, 'age20_1')).toContain('must be integer');
    expect(await validator.integer.validate(data, 'age20_1')).toContain('must be integer');;

    expect(await validator.number.onlyInteger().validate(data, 'age20')).toEqual(undefined);
    expect(await validator.integer.validate(data, 'age20')).toEqual(undefined);
  });

  it ('larger than minimum value', async () => {
    expect(await validator.number.min(100).validate(data, 'id2')).toContain('larger than 100');
    expect(await validator.number.min(2, false).validate(data, 'id2')).toContain('larger than 2');
    expect(await validator.number.min(2).validate(data, 'id2')).toEqual(undefined);
  });

  it ('smaller than maximum value', async () => {
    expect(await validator.number.max(9).validate(data, 'age10')).toContain('smaller than 9');
    expect(await validator.number.max(10, false).validate(data, 'age10')).toContain('smaller than 10');
    expect(await validator.number.max(10).validate(data, 'age10')).toEqual(undefined);
  });

  it ('should between minimum and maximum value', async () => {
    expect(await validator.number.min(3).max(5).validate(data, 'id2')).toContain('between 3 and 5');
    expect(await validator.number.min(2, false).max(5).validate(data, 'id2')).toContain('between 2 and 5');
    expect(await validator.number.min(-1).max(1).validate(data, 'id2')).toContain('between -1 and 1');
    expect(await validator.number.min(-1).max(2, false).validate(data, 'id2')).toContain('between -1 and 2');
    expect(await validator.number.min(-1).max(5).validate(data, 'id2')).toEqual(undefined);
    expect(await validator.number.min(-1, false).max(5, false).validate(data, 'id2')).toEqual(undefined);
  });

  it ('should reject NAN', async () => {
    expect(await validator.number.validate(data, 'nan')).toContain('must be number');
  });

  it ('can transform data by user', async () => {
    await validator
      .number
      .transform(String)
      .validate(data, 'age20');

    expect(data['age20']).toEqual('20');
  });

  it ('can valiate or fix presision', async () => {
    expect(await validator.number.precision(5).validate(data, 'float3')).toBeUndefined();
    expect(await validator.number.precision(3).validate(data, 'float3')).toBeUndefined();
    expect(await validator.number.precision(2).validate(data, 'float3')).toContain('no more than');
    expect(await validator.number.precision(2, true).validate(data, 'float3')).toBeUndefined();
    expect(data.float3).toBe(20.33);

    expect(await validator.number.precision(10).validate(data, 'float10')).toBeUndefined();
    expect(await validator.number.precision(12).validate(data, 'float12')).toBeUndefined();
    expect(await validator.number.precision(11).validate(data, 'float12')).toContain('no more than');
    expect(await validator.number.precision(11, true).validate(data, 'float12')).toBeUndefined();
    expect(data.float12).toBe(2.2e-10);
  });
});
