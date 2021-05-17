import { validator } from '../../src';
import { cloneDeep } from 'lodash';

const defaultData = {
  numberArray: [2, 3, 4],
  strArray: ['2', '5', '7', '8', '12'],
  age10: 10,
  age20str: '20',
  mixArray: [2, '5', 6],
  objectArray: [
    {
      hello: 'world',
    },
  ],
  repeatArray: [1, 2, 2, 2, 3],
};

describe('Array validator', () => {
  let data: typeof defaultData;

  beforeEach(() => {
    data = cloneDeep(defaultData);
  });

  it('may be undefined', async () => {
    expect(
      await validator.array
        .items(validator.number)
        .validate(data, 'numberArray'),
    ).toBeUndefined();
    expect(
      await validator.array.optional().validate(data, 'notfound'),
    ).toBeUndefined();
  });

  it('should has default value', async () => {
    const newlyData: Record<string, any> = {};

    expect(
      await validator.array
        .items(validator.number)
        .default([15])
        .validate(newlyData, 'no-data'),
    ).toBeUndefined();
    expect(newlyData['no-data']).toContain(15);
  });

  it('should convert to array type automatically', async () => {
    expect(await validator.array.validate(data, 'age10')).toBeUndefined();
    expect(await validator.array.validate(data, 'age20str')).toBeUndefined();
  });

  it('more than minimum item length', async () => {
    expect(
      await validator.array.minLength(10).validate(data, 'strArray'),
    ).toContain('more than 10');
    expect(
      await validator.array.minLength(5).validate(data, 'strArray'),
    ).toBeUndefined();
    expect(
      await validator.array.minLength(3).validate(data, 'strArray'),
    ).toBeUndefined();
  });

  it('less than maximum item length', async () => {
    expect(
      await validator.array.maxLength(3).validate(data, 'strArray'),
    ).toContain('less than 3');
    expect(
      await validator.array.maxLength(5).validate(data, 'strArray'),
    ).toBeUndefined();
    expect(
      await validator.array.maxLength(7).validate(data, 'strArray'),
    ).toBeUndefined();
  });

  it('should between minimum and maximum item length', async () => {
    expect(
      await validator.array
        .minLength(1)
        .maxLength(4)
        .validate(data, 'strArray'),
    ).toContain('between');
    expect(
      await validator.array
        .minLength(1)
        .maxLength(7)
        .validate(data, 'strArray'),
    ).toBeUndefined();
  });

  it('string item can convert to number', async () => {
    expect(
      await validator.array.items(validator.number).validate(data, 'strArray'),
    ).toBeUndefined();
    (data.strArray as string[]).forEach((item) => {
      expect(typeof item).toEqual('number');
    });

    expect(
      await validator.array.items(validator.number).validate(data, 'mixArray'),
    ).toBeUndefined();
    (data.mixArray as any[]).forEach((item) => {
      expect(typeof item).toEqual('number');
    });
  });

  it('number item can convert to string', async () => {
    expect(
      await validator.array
        .items(validator.string)
        .validate(data, 'numberArray'),
    ).toBeUndefined();
    data.numberArray.forEach((item) => {
      expect(typeof item).toEqual('string');
    });

    expect(
      await validator.array.items(validator.string).validate(data, 'mixArray'),
    ).toBeUndefined();
    (data.mixArray as any[]).forEach((item) => {
      expect(typeof item).toEqual('string');
    });
  });

  it('should support nested keys', async () => {
    // @ts-expect-error
    data.mixArray.push({});
    const result = await validator.array
      .items(validator.number)
      .validate(data, 'mixArray');
    expect(typeof result).toEqual('string');
    expect(result).toContain('mixArray.3');
  });

  it('can transform data by user', async () => {
    await validator.array
      .items(validator.number)
      .transform((values) => values.map((value) => value + 1))
      .validate(data, 'numberArray');

    expect(data['numberArray']).toMatchObject([3, 4, 5]);
  });

  it('can accept object validators', async () => {
    const msg = await validator.array
      .items({
        hello: validator.number,
      })
      .validate(data, 'objectArray');

    expect(msg).toContain('objectArray.0.hello');
  });

  it('can distinct array items', async () => {
    const msg = await validator.array
      .items(validator.number)
      .minLength(data.repeatArray.length)
      .distinct()
      .validate(data, 'repeatArray');

    expect(msg).toContain('more than');
  });
});
