
import { validator } from '../../src';
import { cloneDeep } from 'lodash';

const defaultData = {
  id2: 2,
  hello: 'hello',
  obj: {},
  nan: Number.NaN,
};

describe('String validator', () => {
  let data: typeof defaultData;

  beforeEach(() => {
    data = cloneDeep(defaultData);
  });

  it ('may be undefined', () => {
    expect(validator.string.validate(data, 'hello')).toEqual(undefined);
    expect(validator.string.optional().validate(data, 'notfound')).toEqual(undefined);
    expect(validator.string.validate(data, 'notfound')).toContain('is required');
  });

  it ('should has default value', () => {
    const newlyData: Record<string, any> = {};

    validator.string.default('world').validate(newlyData, 'hello');
    expect(newlyData['hello']).toEqual('world');
  });

  it ('more than minimum length', () => {
    expect(validator.string.minLength(10).validate(data, 'hello')).toContain('more than 10');
    expect(validator.string.minLength(5).validate(data, 'hello')).toEqual(undefined);
    expect(validator.string.minLength(3).validate(data, 'hello')).toEqual(undefined);
  });

  it ('less than maximum length', () => {
    expect(validator.string.maxLength(3).validate(data, 'hello')).toContain('less than 3');
    expect(validator.string.maxLength(5).validate(data, 'hello')).toEqual(undefined);
    expect(validator.string.maxLength(7).validate(data, 'hello')).toEqual(undefined);
  });

  it ('should between minimum and maximum length', () => {
    expect(validator.string.minLength(1).maxLength(4).validate(data, 'hello')).toContain('between 1 and 4');
    expect(validator.string.minLength(6).maxLength(10).validate(data, 'hello')).toContain('between 6 and 10');
    expect(validator.string.minLength(1).maxLength(7).validate(data, 'hello')).toEqual(undefined);
  });

  it ('should only convert number to string', () => {
    expect(validator.string.validate(data, 'id2')).toEqual(undefined);
    expect(data.id2).toEqual('2');

    expect(validator.string.validate(data, 'nan')).toContain('must be string');
    expect(validator.string.validate(data, 'obj')).toContain('must be string');
  });

  it ('can transform data by user', () => {
    validator
      .string
      .transform((value) => Object.prototype.toString.call(value))
      .validate(data, 'hello');

    expect(data['hello']).toEqual('[object String]');
  });
});
