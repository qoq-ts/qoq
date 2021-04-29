import { Validator, ValidatorOptions, ValidatorType } from './Validator';

type Constraint = Record<string, Validator>;

interface JsonOptions<T> extends ValidatorOptions<T> {
  constraint?: Constraint;
}

export class JsonValidator<T = object> extends Validator<JsonOptions<T>> {
  public constraint<V extends Constraint>(constraint: V): JsonValidator<{ [key in keyof V]: ValidatorType<V[key]> }> {
    this.config.constraint = constraint;
    // @ts-expect-error
    return this;
  }

  declare default: (object: NonNullable<T>) => JsonValidator<NonNullable<T>>;

  declare optional: () => JsonValidator<T | undefined>;

  declare transform: <T1>(fn: (object: T) => Promise<T1> | T1) => JsonValidator<T1>;

  protected async validateValue(data: Record<string, any>, key: string, superKeys: string[]): Promise<string | void> {
    const { constraint } = this.config;
    let value = data[key];

    if (Object.prototype.toString.call(value) !== '[object Object]') {
      if (typeof value === 'string') {
        try {
          data[key] = value = JSON.parse(value);
          if (Object.prototype.toString.call(value) !== '[object Object]') {
            throw new Error();
          }
        } catch (e) {
          return `${this.getLabel(key, superKeys)} must be json`;
        }
      } else {
        return `${this.getLabel(key, superKeys)} must be json`;
      }
    }

    if (constraint) {
      const tempObj: Record<string, any> = {};

      for (const subKey of Object.keys(constraint)) {
        tempObj[subKey] = value[subKey];
        const result = await constraint[subKey]!.validate(tempObj, subKey, superKeys.concat(key));
        if (result) {
          return result;
        }
      }
      data[key] = tempObj;
    }

    return;
  }
}
