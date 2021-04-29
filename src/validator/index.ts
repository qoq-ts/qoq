import { NumberValidator } from './NumberValidator';
import { StringValidator } from './StringValidator';
import { EnumValidator } from './EnumValidator';
import { UrlValidator } from './UrlValidator';
import { ArrayValidator } from './ArrayValidator';
import { JsonValidator } from './JsonValidator';
import { BooleanValidator } from './BooleanValidator';
import { FileValidator } from './FileValidator';
import { EmailValidator } from './EmailValidator';

export class ValidatorStatic {
  get number(): NumberValidator {
    return new NumberValidator();
  }

  get integer(): NumberValidator {
    return new NumberValidator().onlyInteger(true);
  }

  get enum(): EnumValidator {
    return new EnumValidator();
  }

  get string(): StringValidator {
    return new StringValidator();
  }

  get url(): UrlValidator {
    return new UrlValidator();
  }

  get array(): ArrayValidator {
    return new ArrayValidator();
  }

  get json(): JsonValidator {
    return new JsonValidator();
  }

  get boolean(): BooleanValidator {
    return new BooleanValidator();
  }

  get file(): FileValidator {
    return new FileValidator();
  }

  get email(): EmailValidator {
    return new EmailValidator();
  }
}

export const validator = new ValidatorStatic();
