import { JsonValidator } from './JsonValidator';
import { Validator, ValidatorDataType, ValidatorOptions, ValidatorType, ValidatorTypes } from './Validator';

interface ArrayOptions<T> extends ValidatorOptions<T> {
  itemValidator?: Validator;
  minItemLength?: number;
  maxItemLength?: number;
  distinct?: boolean;
}

export interface ArrayDataType {
  type: 'array',
  validator: 'array',
  items?: ValidatorDataType;
}

export class ArrayValidator<T = never[]> extends Validator<ArrayOptions<T>> {
  public items<V extends Validator>(values: V): ArrayValidator<ValidatorType<V>[]>;
  public items<V extends { [key: string]: Validator }>(values: V): ArrayValidator<ValidatorTypes<V>[]>;
  public items(values: Validator | { [key: string]: Validator }): ArrayValidator<any> {
    if (values instanceof Validator) {
      this.config.itemValidator = values;
    } else {
      this.config.itemValidator = new JsonValidator().properties(values);
    }

    return this;
  }

  public minItems(itemsLength: number): this {
    this.config.minItemLength = itemsLength;
    return this;
  }

  public maxItems(itemsLength: number): this {
    this.config.maxItemLength = itemsLength;
    return this;
  }

  public distinct(): this {
    this.config.distinct = true;
    return this;
  }

  declare default: (array: NonNullable<T>) => ArrayValidator<NonNullable<T>>;

  declare optional: () => ArrayValidator<T | undefined>;

  declare transform: <T1>(fn: (array: T) => Promise<T1> | T1) => ArrayValidator<T1>;

  protected async validateValue(data: Record<string, any>, key: string, superKeys: string[]): Promise<string | void> {
    const { minItemLength, maxItemLength, itemValidator, distinct = false } = this.config;
    let value: any[] = data[key];

    if (!Array.isArray(value)) {
      data[key] = value = [value];
    }

    if (distinct) {
      data[key] = value = [...new Set(value)];
    }

    if (minItemLength !== undefined || maxItemLength !== undefined) {
      if (minItemLength !== undefined && value.length < minItemLength) {
        if (maxItemLength === undefined) {
          return `${this.getLabel(key, superKeys)} must includes more than ${minItemLength} items`;
        }

        return `${this.getLabel(key, superKeys)} must has between ${minItemLength} and ${maxItemLength} array items`;
      }

      if (maxItemLength !== undefined && value.length > maxItemLength) {
        if (minItemLength === undefined) {
          return `${this.getLabel(key, superKeys)} must includes less than ${maxItemLength} items`;
        }

        return `${this.getLabel(key, superKeys)} must has between ${minItemLength} and ${maxItemLength} items`;
      }
    }

    if (itemValidator) {
      const newSuperKeys = superKeys.concat(key);

      for (let index = 0; index < value.length; ++index) {
        const result = await itemValidator.validate(value, index.toString(), newSuperKeys);
        if (result) {
          return result;
        }
      }
    }

    return;
  }

  protected getDataType(): ArrayDataType {
    return {
      type: 'array',
      validator: 'array',
      items: this.config.itemValidator?.toJSON(),
    };
  }
}
