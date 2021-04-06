interface Document {
  name?: string;
  description?: string;
}

export interface ValidatorOptions<Type, IsRequired extends boolean> extends Document {
  defaultValue?: Type;
  required: IsRequired;
}

export type ValidatorTypes<T> = {
  [key in keyof T]: ValidatorType<T[key]>;
};

export type ValidatorType<T> = T extends Validator<infer Options>
? NonNullable<Options['defaultValue']> |
  (
    Options['required'] extends true
      ? NonNullable<Options['defaultValue']>
      : undefined
  )
: never;

export abstract class Validator<T extends ValidatorOptions<any, boolean> = ValidatorOptions<any, boolean>>{
  protected readonly config: T;

  constructor() {
    // @ts-expect-error
    this.config = {
      required: true,
    };
  }

  public optional(): any {
    this.config.required = false;
    return this;
  }

  protected default(value: any): any {
    this.optional();
    this.config.defaultValue = value;
    return this;
  }

  public docs(docs: Document): this {
    Object.assign(this.config, docs);
    return this;
  }

  public/*protected*/ validate(obj: Record<string, any>, key: string, superKeys: string[] = []): string | void {
    const { defaultValue, required } = this.config;
    let value = obj[key];

    if (this.isEmpty(value)) {
      obj[key] = value = defaultValue;

      if (value === undefined) {
        if (required) {
          return `${this.getLabel(key, superKeys)} is required`;
        }

        return;
      }
    }

    return this.validateValue(obj, key, superKeys);
  }

  protected getLabel(key: string, superKeys: string[]): string {
    return superKeys.concat(key).join('.');
  }

  protected isEmpty(value: any): boolean {
    return value === undefined || value === null || value === '';
  }

  protected abstract validateValue(data: Record<string, any>, key: string, superKeys: string[]): string | void;

  public/*protected*/ toJSON() {
    return {
      name: this.config.name || '',
      description: this.config.description || '',
      defaultValue: this.config.defaultValue ?? '',
      required: this.config.required,
    };
  }
}
