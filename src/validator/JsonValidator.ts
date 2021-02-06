import { Validator, ValidatorOptions, ValidatorType } from './Validator';

type Constraint = Record<string, Validator>;

interface JsonOptions<T, IsRequired extends boolean> extends ValidatorOptions<T, IsRequired> {
  constraint?: Constraint;
}

export class JsonValidator<Type extends object = object, T extends boolean = true> extends Validator<JsonOptions<Type, T>> {
  public constraint<V extends Constraint>(constraint: V): JsonValidator<{ [key in keyof V]: ValidatorType<V[key]> }, T> {
    this.config.constraint = constraint;
    // @ts-expect-error
    return this;
  }

  public default(value: Type): JsonValidator<Type, true> {
    return super.default(value);
  }

  public optional(): JsonValidator<Type, false> {
    return super.optional();
  }

  protected validateValue(data: Record<string, any>, key: string, superKeys: string[]): string | void {
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
        const result = constraint[subKey]!.validate(tempObj, subKey, superKeys.concat(key));
        if (result) {
          return result;
        }
      }
      data[key] = tempObj;
    }

    return;
  }
}
