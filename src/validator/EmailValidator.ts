import email from 'email-validator';
import { Validator, ValidatorOptions } from './Validator';

interface EmailOptions<T> extends ValidatorOptions<T> {}

export class EmailValidator<T = string> extends Validator<EmailOptions<T>> {
  declare optional: () => EmailValidator<T | undefined>;

  declare default: (email: NonNullable<T>) => EmailValidator<NonNullable<T>>;

  declare transform: <T1>(fn: (email: T) => Promise<T1> | T1) => EmailValidator<T1>;

  protected async validateValue(data: Record<string, any>, key: string, superKeys: string[]): Promise<string | void> {
    const value = data[key];

    if (typeof value === 'string' && email.validate(value)) {
      return;
    }

    return `${this.getLabel(key, superKeys)} must be email`;
  }
}
