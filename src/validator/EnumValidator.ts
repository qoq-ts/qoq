import { Validator, ValidatorOptions } from './Validator';

interface EnumOptions<T> extends ValidatorOptions<T> {
  ranges: T[];
  strict?: boolean;
}

export class EnumValidator<T = number | string> extends Validator<EnumOptions<T>> {
  constructor() {
    super();
    this.config.ranges = [];
    this.config.strict = false;
  }

  public range<Types extends number | string>(values: Types[]): EnumValidator<Types> {
    // @ts-expect-error
    this.config.ranges = values;
    // @ts-expect-error
    return this;
  }

  public strict(is: boolean = true): this {
    this.config.strict = is;
    return this;
  }

  public default(value: NonNullable<T>): EnumValidator<NonNullable<T>> {
    return super.default(value);
  }

  public optional(): EnumValidator<T | undefined> {
    return super.optional();
  }

  /**
   * Make sure you call it at the ending of chain.
   */
  transform<T1>(fn: (value: T) => T1): EnumValidator<T1> {
    this.config.transform = fn;
    // @ts-expect-error
    return this;
  }

  protected validateValue(obj: Record<string, any>, key: string, superKeys: string[]): string | void {
    const { ranges, strict } = this.config;
    let value = obj[key];

    if (ranges.includes(value)) {
      return;
    }

    if (strict) {
      return `${this.getLabel(key, superKeys)} must be in range of ${JSON.stringify(ranges)}`;
    }

    for (const range of ranges) {
      if (typeof range === 'string' && typeof value === 'number') {
        const tempValue = value.toString();

        if (tempValue === range) {
          obj[key] = tempValue;
          return;
        }
      } else if (typeof range === 'number' && typeof value === 'string') {
        const tempValue = Number(value);

        if (tempValue === range) {
          obj[key] = tempValue;
          return;
        }
      }
    }

    return `${this.getLabel(key, superKeys)} must be in range of ${JSON.stringify(ranges)}`;
  }
}
