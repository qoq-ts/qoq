import { Validator, ValidatorDataType, ValidatorOptions, ValidatorType } from './Validator';

type Property = Record<string, Validator>;

interface JsonOptions<T> extends ValidatorOptions<T> {
  properties?: Property;
}

export interface JsonDataType {
  type: 'object',
  validator: 'json',
  properties: Record<string, ValidatorDataType>,
}

export class JsonValidator<T = object> extends Validator<JsonOptions<T>> {
  public property<V extends Property>(properties: V): JsonValidator<{ [key in keyof V]: ValidatorType<V[key]> }> {
    this.config.properties = properties;
    // @ts-expect-error
    return this;
  }

  declare default: (object: NonNullable<T>) => JsonValidator<NonNullable<T>>;

  declare optional: () => JsonValidator<T | undefined>;

  declare transform: <T1>(fn: (object: T) => Promise<T1> | T1) => JsonValidator<T1>;

  protected async validateValue(data: Record<string, any>, key: string, superKeys: string[]): Promise<string | void> {
    const { properties } = this.config;
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

    if (properties) {
      const tempObj: Record<string, any> = {};
      const keys = Object.keys(properties);
      const newSuperKeys = superKeys.concat(key);

      for (let i = 0; i < keys.length; ++i) {
        const subKey = keys[i]!;
        tempObj[subKey] = value[subKey];

        const result = await properties[subKey]!.validate(tempObj, subKey, newSuperKeys);
        if (result) {
          return result;
        }
      }
      data[key] = tempObj;
    }

    return;
  }

  protected getDataType(): JsonDataType {
    const properties: JsonDataType['properties'] = {};

    Object.entries(this.config.properties || {}).forEach(([key, validator]) => {
      properties[key] = validator.toJSON();
    });

    return {
      type: 'object',
      validator: 'json',
      properties,
    };
  }
}
