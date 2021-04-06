import { validator } from '../../src';

describe('Array validator', () => {
  let data: Record<string, any> = {};

  beforeEach(() => {
    data = {
      numberArray: [2, 3, 4],
      strArray: ['2', '5' , '7', '8', '12'],
      age10: 10,
      age20str: '20',
      mixArray: [2, '5', 6],
    };
  });

  it ('may be undefined', () => {
    expect(validator.array.each(validator.number).validate(data, 'numberArray')).toEqual(undefined);
    expect(validator.array.optional().validate(data, 'notfound')).toEqual(undefined);
  });

  it ('should has default value', () => {
    const newlyData: Record<string, any> = {};

    expect(validator.array.each(validator.number).default([15]).validate(newlyData, 'no-data')).toEqual(undefined);
    expect(newlyData['no-data']).toContain(15);
  });

  it ('should convert to array type automatically', () => {
    expect(validator.array.validate(data, 'age10')).toEqual(undefined);
    expect(validator.array.validate(data, 'age20str')).toEqual(undefined);
  });

  it ('more than minimum item length', () => {
    expect(validator.array.minItemLength(10).validate(data, 'strArray')).toContain('more than 10');
    expect(validator.array.minItemLength(5).validate(data, 'strArray')).toEqual(undefined);
    expect(validator.array.minItemLength(3).validate(data, 'strArray')).toEqual(undefined);
  });

  it ('less than maximum item length', () => {
    expect(validator.array.maxItemLength(3).validate(data, 'strArray')).toContain('less than 3');
    expect(validator.array.maxItemLength(5).validate(data, 'strArray')).toEqual(undefined);
    expect(validator.array.maxItemLength(7).validate(data, 'strArray')).toEqual(undefined);
  });

  it ('should between minimum and maximum item length', () => {
    expect(validator.array.minItemLength(1).maxItemLength(4).validate(data, 'strArray')).toContain('between');
    expect(validator.array.minItemLength(1).maxItemLength(7).validate(data, 'strArray')).toEqual(undefined);
  });

  it ('string item can convert to number', () => {
    expect(validator.array.each(validator.number).validate(data, 'strArray')).toEqual(undefined);
    (data.strArray as string[]).forEach((item) => {
      expect(typeof item).toEqual('number');
    });

    expect(validator.array.each(validator.number).validate(data, 'mixArray')).toEqual(undefined);
    (data.mixArray as any[]).forEach((item) => {
      expect(typeof item).toEqual('number');
    });
  });

  it ('number item can convert to string', () => {
    expect(validator.array.each(validator.string).validate(data, 'numberArray')).toEqual(undefined);
    (data.numberArray as string[]).forEach((item) => {
      expect(typeof item).toEqual('string');
    });

    expect(validator.array.each(validator.string).validate(data, 'mixArray')).toEqual(undefined);
    (data.mixArray as any[]).forEach((item) => {
      expect(typeof item).toEqual('string');
    });
  });

  it ('should support nested keys', () => {
    data.mixArray.push({});
    const result = validator.array.each(validator.number).validate(data, 'mixArray');
    expect(typeof result).toEqual('string');
    expect(result).toContain('mixArray.3');
  });
});
