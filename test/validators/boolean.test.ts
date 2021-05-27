import { validator } from '../../src';
import { cloneDeep } from 'lodash-es';

const defaultData = {
  true1: 1,
  true1str: '1',
  false0: 0,
  false0str: '0',
  trueboolean: true,
  falseboolean: false,
  id5: 5,
};

describe('Boolean validator', () => {
  let data: typeof defaultData;

  beforeEach(() => {
    data = cloneDeep(defaultData);
  });

  it('may be undefined', async () => {
    expect(await validator.boolean.validate(data, 'true1')).toBeUndefined();
    expect(await validator.boolean.optional().validate(data, 'notfound')).toBeUndefined();
  });

  it('should has default value', async () => {
    const newlyData: Record<string, any> = {};

    expect(await validator.boolean.default(true).validate(newlyData, 'no-data')).toBeUndefined();
    expect(newlyData['no-data']).toEqual(true);
  });

  it('value may be 0, 1, true and false', async () => {
    expect(await validator.boolean.validate(data, 'true1')).toBeUndefined();
    expect(data['true1']).toEqual(true);

    expect(await validator.boolean.validate(data, 'true1str')).toBeUndefined();
    expect(data['true1str']).toEqual(true);

    expect(await validator.boolean.validate(data, 'trueboolean')).toBeUndefined();
    expect(data['trueboolean']).toEqual(true);

    expect(await validator.boolean.validate(data, 'false0')).toBeUndefined();
    expect(data['false0']).toEqual(false);

    expect(await validator.boolean.validate(data, 'false0str')).toBeUndefined();
    expect(data['false0str']).toEqual(false);

    expect(await validator.boolean.validate(data, 'falseboolean')).toBeUndefined();
    expect(data['falseboolean']).toEqual(false);

    expect(await validator.boolean.validate(data, 'id5')).toContain('must be boolean');
  });

  it('can customize allowed values', async () => {
    expect(await validator.boolean.trueValues([5, true]).validate(data, 'id5')).toBeUndefined();
    expect(data['id5']).toEqual(true);

    expect(await validator.boolean.trueValues(['0']).validate(data, 'false0str')).toBeUndefined();
    expect(data['false0str']).toEqual(true);

    expect(
      await validator.boolean.trueValues([false]).falseValues([true]).validate(data, 'trueboolean'),
    ).toBeUndefined();
    expect(data['trueboolean']).toEqual(false);
  });

  it('can transform data by user', async () => {
    await validator.boolean.transform(String).validate(data, 'true1');

    expect(data['true1']).toEqual('true');
  });
});
