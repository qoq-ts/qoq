import { validator } from '../../src';

describe('Boolean validator', () => {
  let data: Record<string, any> = {};

  beforeEach(() => {
    data = {
      true1: 1,
      true1str: '1',
      false0: 0,
      false0str: '0',
      trueboolean: true,
      falseboolean: false,
      id5: 5,
    };
  });

  it ('may be undefined', () => {
    expect(validator.boolean.validate(data, 'true1')).toEqual(undefined);
    expect(validator.boolean.optional().validate(data, 'notfound')).toEqual(undefined);
  });


  it ('should has default value', () => {
    const newlyData: Record<string, any> = {};

    expect(validator.boolean.default(true).validate(newlyData, 'no-data')).toEqual(undefined);
    expect(newlyData['no-data']).toEqual(true);
  });

  it ('value may be 0, 1, true and false', () => {
    expect(validator.boolean.validate(data, 'true1')).toEqual(undefined);
    expect(data['true1']).toEqual(true);

    expect(validator.boolean.validate(data, 'true1str')).toEqual(undefined);
    expect(data['true1str']).toEqual(true);

    expect(validator.boolean.validate(data, 'trueboolean')).toEqual(undefined);
    expect(data['trueboolean']).toEqual(true);

    expect(validator.boolean.validate(data, 'false0')).toEqual(undefined);
    expect(data['false0']).toEqual(false);

    expect(validator.boolean.validate(data, 'false0str')).toEqual(undefined);
    expect(data['false0str']).toEqual(false);

    expect(validator.boolean.validate(data, 'falseboolean')).toEqual(undefined);
    expect(data['falseboolean']).toEqual(false);

    expect(validator.boolean.validate(data, 'id5')).toContain('must be boolean');
  });

  it ('can customize allowed values', () => {
    expect(validator.boolean.trueValues([5, true]).validate(data, 'id5')).toEqual(undefined);
    expect(data['id5']).toEqual(true);

    expect(validator.boolean.trueValues(['0']).validate(data, 'false0str')).toEqual(undefined);
    expect(data['false0str']).toEqual(true);

    expect(validator.boolean.trueValues([false]).falseValues([true]).validate(data, 'trueboolean')).toEqual(undefined);
    expect(data['trueboolean']).toEqual(false);
  });
});
