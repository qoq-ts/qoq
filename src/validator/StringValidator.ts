import { Validator, ValidatorOptions } from './Validator';

interface StringOptions<T> extends ValidatorOptions<T> {
  minLength?: number;
  maxLength?: number;
  caseType?: 'lower' | 'upper' | 'title';
  pattern?: RegExp;
  trim?: boolean;
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

  toLowerCase(): this {
    this.config.caseType = 'lower';
    return this;
  }

  toUpperCase(): this {
    this.config.caseType = 'upper';
    return this;
  }

  toTitleCase(): this {
    this.config.caseType = 'title';
    return this;
  }

  trim(): this {
    this.config.trim = true;
    return this;
  }

  match(pattern: RegExp): this {
    this.config.pattern = pattern;
    return this;
  }

  declare optional: () => StringValidator<T | undefined>;

  declare default: (string: NonNullable<T>) => StringValidator<NonNullable<T>>;

  declare transform: <T1>(fn: (string: T) => Promise<T1> | T1) => StringValidator<T1>;

  protected isEmpty(value: any): boolean {
    return typeof value !== 'string' && super.isEmpty(value);
  }

  protected async validateValue(data: Record<string, any>, key: string, superKeys: string[]): Promise<string | void> {
    const { minLength, maxLength, caseType, pattern, trim } = this.config;
    let value: string = data[key];

    if (typeof value !== 'string') {
      if (typeof value === 'number' && !Number.isNaN(value)) {
        data[key] = value = (value as number).toString();
      } else {
        return `${this.getLabel(key, superKeys)} must be string`;
      }
    }

    if (trim) {
      data[key] = value = value.trim();
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

    switch (caseType) {
      case 'lower':
        data[key] = value = value.toLowerCase();
        break;
      case 'upper':
        data[key] = value = value.toUpperCase();
        break;
      case 'title':
        data[key] = value = value.substr(0, 1).toUpperCase() + value.substr(1).toLowerCase();
        break;
    }

    if (pattern && !pattern.test(value)) {
      return `${this.getLabel(key, superKeys)} doesn't match regular expression`;
    }

    return;
  }
}
