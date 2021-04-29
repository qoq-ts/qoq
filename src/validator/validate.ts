import createError from 'http-errors';
import { Validator, ValidatorTypes } from './Validator';

export const validate = async <T extends { [key: string]: Validator }>(sourceData: Record<string, any>, validators: T): Promise<ValidatorTypes<T>> => {
  const payload: Record<string, any> = {};
  const keys = Object.keys(validators);

  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i]!;

    payload[key] = sourceData[key];

    const msg = await validators[key]!.validate(payload, key);
    if (msg) {
      throw createError(400, msg);
    }
  }

  return payload as ValidatorTypes<T>;
};
