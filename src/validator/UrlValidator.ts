import { URL } from 'url';
import { Validator, ValidatorOptions } from './Validator';

interface UrlOptions<T> extends ValidatorOptions<T> {
  schemes?: string[];
}

export interface UrlDataType {
  type: 'string';
  validator: 'url';
}

export class UrlValidator<T = string> extends Validator<UrlOptions<T>> {
  protected protocols = ['http:', 'https:'];

  /**
   * The first part of url. Default to `['http', 'https']`
   */
  public schemes(schemes: string[]): this {
    this.protocols = schemes.map((scheme) => scheme.toLowerCase() + ':');
    return this;
  }

  declare optional: () => UrlValidator<T | undefined>;

  declare default: (url: NonNullable<T>) => UrlValidator<NonNullable<T>>;

  declare transform: <T1>(
    fn: (value: T) => Promise<T1> | T1,
  ) => UrlValidator<T1>;

  protected async validateValue(
    data: Record<string, any>,
    key: string,
    superKeys: string[],
  ): Promise<string | void> {
    const url = this.getURL(data[key]);

    if (!url) {
      return `${this.getLabel(key, superKeys)} must be url`;
    }

    if (!this.protocols.includes(url.protocol)) {
      return `${this.getLabel(key, superKeys)} doesn't match url scheme`;
    }

    return;
  }

  protected getURL(url: string) {
    if (typeof url !== 'string') {
      return false;
    }

    try {
      return new URL(url);
    } catch {
      return false;
    }
  }

  protected getDataType(): UrlDataType {
    return {
      type: 'string',
      validator: 'url',
    };
  }
}
