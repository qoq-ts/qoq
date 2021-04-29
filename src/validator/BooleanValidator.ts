import { Validator, ValidatorOptions } from './Validator';

interface BooleanOptions<T> extends ValidatorOptions<T> {
  trueValues?: any[];
  falseValues?: any[];
}

export class BooleanValidator<T = boolean> extends Validator<BooleanOptions<T>> {
  protected static trueValues: any[] = [1, '1', true, 'true'];
  protected static falseValues: any[] = [0, '0', false, 'false'];

  public trueValues(values: any[]): this {
    this.config.trueValues = values;
    return this;
  }

  public falseValues(values: any[]): this {
    this.config.falseValues = values;
    return this;
  }

  declare optional: () => BooleanValidator<T | undefined>;

  declare default: (boolean: NonNullable<T>) => BooleanValidator<NonNullable<T>>;

  declare transform: <T1>(fn: (boolean: T) => T1) => BooleanValidator<T1>;

  protected validateValue(obj: Record<string, any>, key: string, superKeys: string[]): string | void {
    const {
       trueValues = BooleanValidator.trueValues,
       falseValues = BooleanValidator.falseValues,
    } = this.config;
    const value = obj[key];

    if (trueValues.includes(value)) {
      obj[key] = true;
    } else if (falseValues.includes(value)) {
      obj[key] = false;
    } else {
      return `${this.getLabel(key, superKeys)} must be boolean`;
    }
  }
}
