import { Validator, ValidatorOptions } from './Validator';

interface StringOptions<T> extends ValidatorOptions<T> {
  minLength?: number;
  maxLength?: number;
}

export class StringValidator<T = string> extends Validator<StringOptions<T>> {
  minLength(min: number): this {
    this.config.minLength = min;
    return this;
  }

  maxLength(max: number): this {
    this.config.maxLength = max;
    return this;
  }

  optional(): StringValidator<T | undefined> {
    return super.optional();
  }

  default(value: NonNullable<T>): StringValidator<NonNullable<T>> {
    return super.default(value);
  }

  /**
   * Make sure you call it at the ending of chain.
   */
  transform<T1>(fn: (value: T) => T1): StringValidator<T1> {
    this.config.transform = fn;
    // @ts-expect-error
    return this;
  }

  protected isEmpty(value: any): boolean {
    return typeof value !== 'string' && super.isEmpty(value);
  }

  protected validateValue(obj: Record<string, any>, key: string, superKeys: string[]): string | void {
    const { minLength, maxLength } = this.config;
    let value = obj[key];

    if (typeof value !== 'string') {
      if (typeof value === 'number' && !Number.isNaN(value)) {
        obj[key] = value = value.toString();
      } else {
        return `${this.getLabel(key, superKeys)} must be string`;
      }
    }

    if (minLength !== undefined && value.length < minLength) {
      if (maxLength === undefined) {
        return `${this.getLabel(key, superKeys)} must includes more than ${minLength} characters`;
      }

      return `${this.getLabel(key, superKeys)} must has between ${minLength} and ${maxLength} characters`;
    }

    if (maxLength !== undefined && value.length > maxLength) {
      if (minLength === undefined) {
        return `${this.getLabel(key, superKeys)} must includes less than ${maxLength} characters`;
      }

      return `${this.getLabel(key, superKeys)} must has between ${minLength} and ${maxLength} characters`;
    }

    return;
  }
}
