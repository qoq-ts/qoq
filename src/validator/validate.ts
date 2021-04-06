import createError from 'http-errors';
import { Validator } from './Validator';

export const validate = (sourceData: Record<string, any>, validators: { [key: string]: Validator }) => {
  const payload: Record<string, any> = {};
  const keys = Object.keys(validators);

  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i]!;

    payload[key] = sourceData[key];

    const msg = validators[key]!.validate(payload, key);
    if (msg) {
      throw createError(400, msg);
    }
  }

  return payload;
};
