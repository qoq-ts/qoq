import { Validator, ValidatorOptions } from './Validator';

interface UrlOptions<T> extends ValidatorOptions<T> {
  schemes?: string[];
}

export class UrlValidator<T = string> extends Validator<UrlOptions<T>> {
  protected validSchemes = ['http', 'https'];

  protected pattern = '^{schemes}:\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(?::\d{1,5})?(?:$|[?\/#])';

  public schemes(schemes: string[]): this {
    this.validSchemes = schemes;
    return this;
  }

  optional(): UrlValidator<T | undefined> {
    return super.optional();
  }

  default(url: NonNullable<T>): UrlValidator<NonNullable<T>> {
    return super.default(url);
  }

  /**
   * Make sure you call it at the ending of chain.
   */
  transform<T1>(fn: (value: T) => T1): UrlValidator<T1> {
    this.config.transform = fn;
    // @ts-expect-error
    return this;
  }

  protected validateValue(data: Record<string, any>, key: string, superKeys: string[]): string | void {
    const value = data[key];

    if (typeof value === 'string' && value.length < 2000) {
      const pattern = new RegExp(this.pattern.replace('{schemes}', this.validSchemes.join('|')), 'i');

      if (pattern.test(value)) {
        return;
      }
    }

    return `${this.getLabel(key, superKeys)} must be url`;
  }
}
