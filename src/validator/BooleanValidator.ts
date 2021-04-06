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

  public optional(): BooleanValidator<T | undefined> {
    return super.optional();
  }

  public default(value: NonNullable<T>): BooleanValidator<NonNullable<T>> {
    return super.default(value);
  }

  /**
   * Make sure you call it at the ending of chain.
   */
  transform<T1>(fn: (value: T) => T1): BooleanValidator<T1> {
    this.config.transform = fn;
    // @ts-expect-error
    return this;
  }

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
