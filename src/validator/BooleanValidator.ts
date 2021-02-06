import { Validator, ValidatorOptions } from './Validator';

interface BooleanOptions<IsRequired extends boolean> extends ValidatorOptions<boolean, IsRequired> {
  trueValues?: any[];
  falseValues?: any[];
}

export class BooleanValidator<T extends boolean = true> extends Validator<BooleanOptions<T>> {
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

  public optional(): BooleanValidator<false> {
    return super.optional();
  }

  public default(value: boolean): BooleanValidator<true> {
    return super.default(value);
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
