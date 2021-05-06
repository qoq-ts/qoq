import type { ArrayDataType } from './ArrayValidator';
import type { BooleanDataType } from './BooleanValidator';
import type { EmailDataType } from './EmailValidator';
import type { EnumDataType } from './EnumValidator';
import type { FileDataType } from './FileValidator';
import type { IPDataType } from './IPValidator';
import type { JsonDataType } from './JsonValidator';
import type { NumberDataType } from './NumberValidator';
import type { StringDataType } from './StringValidator';
import type { UrlDataType } from './UrlValidator';
import type { UUIDDataType } from './UUIDValidator';

interface Document {
  label?: string;
  description?: string;
}

export interface ValidatorOptions<Type> extends Document {
  defaultValue: Type;
  required: boolean;
  transform?: (value: Type) => Promise<any> | any;
}

export type ValidatorTypes<T> = {
  [key in keyof T]: ValidatorType<T[key]>;
};

export type ValidatorType<T> = T extends Validator<infer Options>
? Options['defaultValue']
: never;

export interface CommonValidatorDataType {
  label?: string;
  description?: string;
  defaultValue: unknown;
  required: boolean;
};

type SubValidatorDataType =
  | ArrayDataType
  | BooleanDataType
  | EmailDataType
  | EnumDataType
  | FileDataType
  | IPDataType
  | JsonDataType
  | NumberDataType
  | StringDataType
  | UrlDataType
  | UUIDDataType;

export type ValidatorDataType = CommonValidatorDataType & SubValidatorDataType;

export abstract class Validator<T extends ValidatorOptions<any> = ValidatorOptions<any>>{
  protected readonly config: T;

  constructor() {
    // @ts-expect-error
    this.config = {
      required: true,
    };
  }

  public optional(): Validator {
    this.config.required = false;
    return this;
  }

  /**
   * Make sure you call it at the ending of chain.
   */
  transform<T1>(fn: (value: any) => Promise<T1> | T1): Validator {
    this.config.transform = fn;
    return this;
  }

  protected default(value: any): Validator {
    this.optional();
    this.config.defaultValue = value;
    return this;
  }

  public document(docs: Document): this {
    Object.assign(this.config, docs);
    return this;
  }

  public/*protected*/ async validate(data: Record<string, any>, key: string, superKeys: string[] = []): Promise<string | void> {
    const { defaultValue, required } = this.config;
    let value = data[key];

    if (this.isEmpty(value)) {
      data[key] = value = defaultValue;

      if (value === undefined) {
        if (required) {
          return `${this.getLabel(key, superKeys)} is required`;
        }

        return;
      }
    }

    const msg = await this.validateValue(data, key, superKeys);
    if (msg === undefined && typeof this.config.transform === 'function') {
      data[key] = await this.config.transform(data[key]);
    }

    return msg;
  }

  protected getLabel(key: string, superKeys: string[]): string {
    return superKeys.concat(key).join('.');
  }

  protected isEmpty(value: any): boolean {
    return value === undefined || value === null || value === '';
  }

  protected abstract validateValue(data: Record<string, any>, key: string, superKeys: string[]): Promise<string | void>;

  protected abstract getDataType(): SubValidatorDataType;

  public/*protected*/ toJSON(): ValidatorDataType {
    const dataType = this.getDataType();

    return {
      label: this.config.label,
      description: this.config.description,
      defaultValue: this.config.defaultValue,
      required: this.config.required,
      ...dataType,
    };
  }
}
