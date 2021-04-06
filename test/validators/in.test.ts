import { validator } from '../../src';
import { cloneDeep } from 'lodash';

const defaultData = {
  id2: 2,
  id2str: '2',
  age10: 10,
  age20str: '20',
};

describe('In validator', () => {
  let data: typeof defaultData;

  beforeEach(() => {
    data = cloneDeep(defaultData);
  });

  it ('may be undefined', () => {
    expect(validator.in.range([2, 3, '4']).validate(data, 'id2')).toEqual(undefined);
    expect(validator.in.optional().validate(data, 'notfound')).toEqual(undefined);
    expect(validator.in.validate(data, 'notfound')).toContain('is required');
  });

  it ('should has default value', () => {
    const newlyData: Record<string, any> = {};

    expect(validator.in.range([15, 20]).default(15).validate(newlyData, 'id2')).toEqual(undefined);
    expect(newlyData['id2']).toEqual(15);
  });

  it ('should be not strict by default', () => {
    expect(validator.in.range(['2', 3, '4']).validate(data, 'id2')).toEqual(undefined);
    expect(data['id2']).toEqual('2');

    expect(validator.in.range([2, 3, '4']).validate(data, 'id2str')).toEqual(undefined);
    expect(data['id2str']).toEqual(2);
  });

  it ('can set strict mode', () => {
    expect(validator.in.strict().range(['2', 3, '4']).validate(data, 'id2')).toContain('["2",3,"4"]');
    expect(validator.in.strict().range([2, 3, '4']).validate(data, 'id2str')).toContain('[2,3,"4"]');
  });

  it ('should not hint range data', () => {
    expect(validator.in.range(['2', 3, '4']).validate(data, 'age10')).toContain('["2",3,"4"]');
  });

  it ('can transform data by user', () => {
    validator
      .in
      .range([2, 3, 4])
      .transform((value) => value * 10)
      .validate(data, 'id2');

    expect(data['id2']).toEqual(20);
  });
});
