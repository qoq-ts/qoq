import { Validator, ValidatorOptions, ValidatorType } from './Validator';

interface ArrayOptions<T, IsRequired extends boolean> extends ValidatorOptions<T, IsRequired> {
  itemValidator?: Validator;
  minItemLength?: number;
  maxItemLength?: number;
}

export class ArrayValidator<Type extends any[] = never[], T extends boolean = true> extends Validator<ArrayOptions<Type, T>> {
  public each<V extends Validator>(values: V): ArrayValidator<ValidatorType<V>[], T> {
    this.config.itemValidator = values;
    return this;
  }

  public minItemLength(itemLength: number): this {
    this.config.minItemLength = itemLength;
    return this;
  }

  public maxItemLength(itemLength: number): this {
    this.config.maxItemLength = itemLength;
    return this;
  }

  public default(value: Type): ArrayValidator<Type, true> {
    return super.default(value);
  }

  public optional(): ArrayValidator<Type, false> {
    return super.optional();
  }

  protected validateValue(data: Record<string, any>, key: string, superKeys: string[]): string | void {
    const { minItemLength, maxItemLength, itemValidator } = this.config;
    let value: any[] = data[key];

    if (!Array.isArray(value)) {
      data[key] = value = [value];
    }

    if (minItemLength !== undefined || maxItemLength !== undefined) {
      if (minItemLength !== undefined && value.length < minItemLength) {
        if (maxItemLength === undefined) {
          return `${this.getLabel(key, superKeys)} must includes more than ${minItemLength} array items`;
        }

        return `${this.getLabel(key, superKeys)} must has between ${minItemLength} and ${maxItemLength} array items`;
      }

      if (maxItemLength !== undefined && value.length > maxItemLength) {
        if (minItemLength === undefined) {
          return `${this.getLabel(key, superKeys)} must includes less than ${maxItemLength} array items`;
        }

        return `${this.getLabel(key, superKeys)} must has between ${minItemLength} and ${maxItemLength} array items`;
      }
    }

    if (itemValidator) {
      for (let index = 0, length = value.length; index < length; ++index) {
        const result = itemValidator.validate(value, index.toString(), superKeys.concat(key));
        if (result) {
          return result;
        }
      }
    }

    return;
  }
}
