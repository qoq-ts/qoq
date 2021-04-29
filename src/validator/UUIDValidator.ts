import { Validator, ValidatorOptions } from './Validator';

interface UUIDOptions<T> extends ValidatorOptions<T> {
  uuidVersion: '1' | '2' | '3' | '4' | '5' | 'all',
}

const patterns: {
  [key in UUIDOptions<string>['uuidVersion']]: RegExp;
} = {
  '1': /^[0-9A-F]{8}-[0-9A-F]{4}-1[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  '2': /^[0-9A-F]{8}-[0-9A-F]{4}-2[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  '3': /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  '4': /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  '5': /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
};

export class UUIDValidator<T = string> extends Validator<UUIDOptions<T>> {
  declare optional: () => UUIDValidator<T | undefined>;

  declare default: (uuid: NonNullable<T>) => UUIDValidator<NonNullable<T>>;

  declare transform: <T1>(fn: (uuid: T) => Promise<T1> | T1) => UUIDValidator<T1>;

  version(version: UUIDOptions<T>['uuidVersion']): this {
    this.config.uuidVersion = version;
    return this;
  }

  protected async validateValue(data: Record<string, any>, key: string, superKeys: string[]): Promise<string | void> {
    const { uuidVersion = 'all' } = this.config;
    const value = data[key];

    if (typeof value === 'string' && patterns[uuidVersion].test(value)) {
      return;
    }

    return `${this.getLabel(key, superKeys)} must be uuid${uuidVersion === 'all' ? '' : uuidVersion}`;
  }
}
