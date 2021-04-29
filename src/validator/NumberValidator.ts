import { Validator, ValidatorOptions } from './Validator';

interface NumberOptions<T> extends ValidatorOptions<T> {
  min?: number;
  minInclusive?: boolean;
  max?: number;
  maxInclusive?: boolean;
  onlyInteger?: boolean;
}

export class NumberValidator<T = number> extends Validator<NumberOptions<T>> {
  public min(min: number, inclusive: boolean = true): this {
    this.config.min = min;
    this.config.minInclusive = inclusive;
    return this;
  }

  public max(max: number, inclusive: boolean = true): this {
    this.config.max = max;
    this.config.maxInclusive = inclusive;
    return this;
  }

  public onlyInteger(is: boolean = true): this {
    this.config.onlyInteger = is;
    return this;
  }

  declare optional: () => NumberValidator<T | undefined>;

  declare default: (number: NonNullable<T>) => NumberValidator<NonNullable<T>>;

  declare transform: <T1>(fn: (number: T) => T1) => NumberValidator<T1>;

  protected async validateValue(data: Record<string, any>, key: string, superKeys: string[]): Promise<string | void> {
    const { min, max, minInclusive, maxInclusive, onlyInteger } = this.config;
    let value = data[key];

    if (typeof value !== 'number') {
      data[key] = value = Number(value);
    }

    if (Number.isNaN(value)) {
      return `${this.getLabel(key, superKeys)} must be number`;
    }

    if (onlyInteger && !Number.isInteger(value)) {
      return `${this.getLabel(key, superKeys)} must be integer`;
    }

    if (min !== undefined && (minInclusive ? value < min : value <= min)) {
      if (max === undefined) {
        return `${this.getLabel(key, superKeys)} must be larger than ${min}`;
      }

      return `${this.getLabel(key, superKeys)} must be between ${min} and ${max}`;
    }

    if (max !== undefined && (maxInclusive ? value > max : value >= max)) {
      if (min === undefined) {
        return `${this.getLabel(key, superKeys)} must be smaller than ${max}`;
      }

      return `${this.getLabel(key, superKeys)} must be between ${min} and ${max}`;
    }

    return;
  }
}
