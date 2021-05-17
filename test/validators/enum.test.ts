import { validator } from '../../src';
import { cloneDeep } from 'lodash';

const defaultData = {
  id2: 2,
  id2str: '2',
  age10: 10,
  age20str: '20',
  boolTrue: true,
  boolFalse: false,
};

describe('Enum validator', () => {
  let data: typeof defaultData;

  beforeEach(() => {
    data = cloneDeep(defaultData);
  });

  it('may be undefined', async () => {
    expect(
      await validator.enum.range([2, 3, '4']).validate(data, 'id2'),
    ).toBeUndefined();
    expect(
      await validator.enum
        .range([2, 3, '4'])
        .optional()
        .validate(data, 'notfound'),
    ).toBeUndefined();
    expect(
      await validator.enum.range([2, 3, '4']).validate(data, 'notfound'),
    ).toContain('is required');
  });

  it('should has default value', async () => {
    const newlyData: Record<string, any> = {};

    expect(
      await validator.enum
        .range([15, 20])
        .default(15)
        .validate(newlyData, 'id2'),
    ).toBeUndefined();
    expect(newlyData['id2']).toEqual(15);
  });

  it('should not hint range data', async () => {
    expect(
      await validator.enum.range(['2', 3, '4']).validate(data, 'age10'),
    ).toContain('["2",3,"4"]');
  });

  it('can mixin string, number and boolean types', async () => {
    expect(
      await validator.enum
        .range(['2', 3, '4', true, false])
        .validate(data, 'id2str'),
    ).toBeUndefined();
    expect(
      await validator.enum
        .range(['2', 3, '4', true, false])
        .validate(data, 'id2'),
    ).toContain('["2",3,"4",true,false]');

    expect(
      await validator.enum
        .range(['2', 3, '4', true, false])
        .validate(data, 'boolTrue'),
    ).toBeUndefined();
    expect(
      await validator.enum
        .range(['2', 3, '4', true, false])
        .validate(data, 'boolFalse'),
    ).toBeUndefined();
    expect(
      await validator.enum
        .range(['2', 3, '4', true])
        .validate(data, 'boolFalse'),
    ).toContain('["2",3,"4",true]');
  });

  it('can transform data by user', async () => {
    await validator.enum
      .range([2, 3, 4])
      .transform((value) => value * 10)
      .validate(data, 'id2');

    expect(data['id2']).toEqual(20);
  });
});
