
import { validator } from '../../src';


describe('Number validator', () => {
  let data: Record<string, any> = {};

  beforeEach(() => {
    data = {
      id2: 2,
      id2str: '2',
      age2: 2,
      age10: 10,
      age20: 20,
      age20str: '20',
      age20_1: 20.1,
      nan: '2hello',
    };
  });

  it ('may be undefined', () => {
    expect(validator.number.validate(data, 'id2')).toEqual(undefined);
    expect(validator.number.optional().validate(data, 'notfound')).toEqual(undefined);
    expect(validator.number.validate(data, 'notfound')).toContain('is required');
  });

  it ('should has default value', () => {
    const newlyData: Record<string, any> = {};

    validator.number.default(15).validate(newlyData, 'id2');
    expect(newlyData['id2']).toEqual(15);
  });

  it ('support integer only', () => {
    expect(validator.number.onlyInteger().validate(data, 'age20_1')).toContain('must be integer');
    expect(validator.integer.validate(data, 'age20_1')).toContain('must be integer');;

    expect(validator.number.onlyInteger().validate(data, 'age20')).toEqual(undefined);
    expect(validator.integer.validate(data, 'age20')).toEqual(undefined);
  });

  it ('larger than minimum value', () => {
    expect(validator.number.min(100).validate(data, 'id2')).toContain('larger than 100');
    expect(validator.number.min(2, false).validate(data, 'id2')).toContain('larger than 2');
    expect(validator.number.min(2).validate(data, 'id2')).toEqual(undefined);
  });

  it ('smaller than maximum value', () => {
    expect(validator.number.max(9).validate(data, 'age10')).toContain('smaller than 9');
    expect(validator.number.max(10, false).validate(data, 'age10')).toContain('smaller than 10');
    expect(validator.number.max(10).validate(data, 'age10')).toEqual(undefined);
  });

  it ('should between minimum and maximum value', () => {
    expect(validator.number.min(3).max(5).validate(data, 'id2')).toContain('between 3 and 5');
    expect(validator.number.min(2, false).max(5).validate(data, 'id2')).toContain('between 2 and 5');
    expect(validator.number.min(-1).max(1).validate(data, 'id2')).toContain('between -1 and 1');
    expect(validator.number.min(-1).max(2, false).validate(data, 'id2')).toContain('between -1 and 2');
    expect(validator.number.min(-1).max(5).validate(data, 'id2')).toEqual(undefined);
    expect(validator.number.min(-1, false).max(5, false).validate(data, 'id2')).toEqual(undefined);
  });

  it ('should reject NAN', () => {
    expect(validator.number.validate(data, 'nan')).toContain('must be number');
  });
});
