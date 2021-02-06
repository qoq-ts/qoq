import { NumberValidator } from './NumberValidator';
import { StringValidator } from './StringValidator';
import { InValidator } from './InValidator';
import { UrlValidator } from './UrlValidator';
import { ArrayValidator } from './ArrayValidator';
import { JsonValidator } from './JsonValidator';
import { BooleanValidator } from './BooleanValidator';
import { FileValidator } from './FileValidator';

export class ValidatorStatic {
  get number(): NumberValidator {
    return new NumberValidator();
  }

  get integer(): NumberValidator {
    return new NumberValidator().onlyInteger(true);
  }

  get in(): InValidator {
    return new InValidator();
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
}

export const rule = new ValidatorStatic();
