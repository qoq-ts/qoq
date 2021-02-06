import { Validator, ValidatorOptions } from './Validator';

interface UrlOptions<IsRequired extends boolean> extends ValidatorOptions<string, IsRequired> {
  schemes?: string[];
}

export class UrlValidator<T extends boolean = true> extends Validator<UrlOptions<T>> {
  protected validSchemes = ['http', 'https'];

  protected pattern = '^{schemes}:\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(?::\d{1,5})?(?:$|[?\/#])';

  public schemes(schemes: string[]): this {
    this.validSchemes = schemes;
    return this;
  }

  optional(): UrlValidator<false> {
    return super.optional();
  }

  default(url: string): UrlValidator<true> {
    return super.default(url);
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
