import { Validator, ValidatorOptions } from './Validator';

interface EnumOptions<T> extends ValidatorOptions<T> {
  ranges: T[];
}

type AllowedRangeType = string | number | boolean;

export interface EnumDataType {
  type: 'enum';
  validator: 'enum';
  ranges: Array<AllowedRangeType>;
}

export const enumRange = <T extends AllowedRangeType>(values: T[]): EnumValidator<T> => {
  return new EnumValidator(values);
};

export class EnumValidator<T = AllowedRangeType> extends Validator<EnumOptions<T>> {
  constructor(ranges: T[]) {
    super();
    this.config.ranges = ranges;
  }

  declare default: (value: NonNullable<T>) => EnumValidator<NonNullable<T>>;

  declare optional: () => EnumValidator<T | undefined>;

  declare transform: <T1>(fn: (value: T) => Promise<T1> | T1) => EnumValidator<T1>;

  protected async validateValue(data: Record<string, any>, key: string, superKeys: string[]): Promise<string | void> {
    const { ranges } = this.config;
    let value = data[key];

    if (!ranges.includes(value)) {
      return `${this.getLabel(key, superKeys)} must be in range of ${JSON.stringify(ranges)}`;
    }
  }

  protected getDataType(): EnumDataType {
    return {
      type: 'enum',
      validator: 'enum',
      ranges: this.config.ranges as unknown as EnumDataType['ranges'],
    };
  }
}
