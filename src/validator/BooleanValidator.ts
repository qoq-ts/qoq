import { Validator, ValidatorOptions } from './Validator';

interface BooleanOptions<T> extends ValidatorOptions<T> {
  trueValues?: any[];
  falseValues?: any[];
}

export interface BooleanDataType {
  type: 'boolean',
  validator: 'boolean',
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

  declare transform: <T1>(fn: (boolean: T) => Promise<T1> | T1) => BooleanValidator<T1>;

  protected async validateValue(data: Record<string, any>, key: string, superKeys: string[]): Promise<string | void> {
    const {
       trueValues = BooleanValidator.trueValues,
       falseValues = BooleanValidator.falseValues,
    } = this.config;
    const value = data[key];

    if (trueValues.includes(value)) {
      data[key] = true;
    } else if (falseValues.includes(value)) {
      data[key] = false;
    } else {
      return `${this.getLabel(key, superKeys)} must be boolean`;
    }
  }

  protected getDataType(): BooleanDataType {
    return {
      type: 'boolean',
      validator: 'boolean',
    };
  }
}
