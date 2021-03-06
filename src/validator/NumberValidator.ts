import { Validator, ValidatorOptions } from './Validator';

interface NumberOptions<T> extends ValidatorOptions<T> {
  min?: number;
  minInclusive?: boolean;
  max?: number;
  maxInclusive?: boolean;
  onlyInteger?: boolean;
  precision?: number;
  fixPrecision?: boolean;
}

export interface NumberDataType {
  type: 'integer' | 'number';
  validator: 'number';
}

const precisionPattern = /(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/;

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

  /**
   *
   * @param {Number} maxDecimals The maximum inclusive decimals
   * @param {Boolean} perferToFixed The behavior when decimals out of range. Default to `false`.
   * @see Number.prototype.toFixed()
   */
  public precision(maxDecimals: number, perferToFixed?: boolean): this {
    this.config.precision = Math.min(20, Math.max(0, maxDecimals));
    this.config.fixPrecision = perferToFixed === true;
    return this;
  }

  public onlyInteger(is: boolean = true): this {
    this.config.onlyInteger = is;
    return this;
  }

  declare optional: () => NumberValidator<T | undefined>;

  declare default: (number: NonNullable<T>) => NumberValidator<NonNullable<T>>;

  declare transform: <T1>(fn: (number: T) => Promise<T1> | T1) => NumberValidator<T1>;

  protected async validateValue(
    data: Record<string, any>,
    key: string,
    superKeys: string[],
  ): Promise<string | void> {
    const { min, max, minInclusive, maxInclusive, onlyInteger, precision, fixPrecision } =
      this.config;
    let value: number = data[key];

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

    if (precision !== undefined && !Number.isInteger(value)) {
      const matches = value.toString().match(precisionPattern)!;
      const decimals = (matches[1] ? matches[1].length : 0) - (matches[2] ? Number(matches[2]) : 0);

      if (decimals >= 0 && decimals > precision) {
        if (fixPrecision) {
          data[key] = value = Number(value.toFixed(precision));
        } else {
          return `${this.getLabel(key, superKeys)} must have no more than ${precision} decimal`;
        }
      }
    }

    return;
  }

  protected getDataType(): NumberDataType {
    return {
      type: this.config.onlyInteger ? 'integer' : 'number',
      validator: 'number',
    };
  }
}
