import ipRegexp from 'ip-regex';
import { Validator, ValidatorOptions } from './Validator';

interface IPOptions<T> extends ValidatorOptions<T> {
  ipVersion: '4' | '6' | 'all',
}

const patterns: {
  [key in IPOptions<string>['ipVersion']]: RegExp;
} = {
  '4': ipRegexp.v4({ exact: true }),
  '6': ipRegexp.v6({ exact: true }),
  'all': ipRegexp({ exact: true }),
};

export class IPValidator<T = string> extends Validator<IPOptions<T>> {
  /**
   * Default version: `4 + 6`
   */
  public version(version: IPOptions<T>['ipVersion']): this {
    this.config.ipVersion = version;
    return this;
  }

  declare optional: () => IPValidator<T | undefined>;

  declare default: (ip: NonNullable<T>) => IPValidator<NonNullable<T>>;

  declare transform: <T1>(fn: (ip: T) => Promise<T1> | T1) => IPValidator<T1>;

  protected async validateValue(data: Record<string, any>, key: string, superKeys: string[]): Promise<string | void> {
    const { ipVersion = 'all' } = this.config;
    const ip = data[key];

    if (patterns[ipVersion].test(ip)) {
      return;
    }

    return `${this.getLabel(key, superKeys)} must be ip${ipVersion === 'all' ? '' : ipVersion}`;
  }
}
