import { Validator, ValidatorOptions } from './Validator';

interface EnumOptions<T> extends ValidatorOptions<T> {
  ranges: T[];
  strict?: boolean;
}

export interface EnumDataType {
  type: 'enum';
  validator: 'enum';
  ranges: Array<string | number>;
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

  declare default: (value: NonNullable<T>) => EnumValidator<NonNullable<T>>;

  declare optional: () => EnumValidator<T | undefined>;

  declare transform: <T1>(fn: (value: T) => Promise<T1> | T1) => EnumValidator<T1>;

  protected async validateValue(data: Record<string, any>, key: string, superKeys: string[]): Promise<string | void> {
    const { ranges, strict } = this.config;
    let value = data[key];

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
          data[key] = tempValue;
          return;
        }
      } else if (typeof range === 'number' && typeof value === 'string') {
        const tempValue = Number(value);

        if (tempValue === range) {
          data[key] = tempValue;
          return;
        }
      }
    }

    return `${this.getLabel(key, superKeys)} must be in range of ${JSON.stringify(ranges)}`;
  }

  protected getDataType(): EnumDataType {
    return {
      type: 'enum',
      validator: 'enum',
      ranges: this.config.ranges as unknown as EnumDataType['ranges'],
    };
  }
}
