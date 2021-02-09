import { Slot } from './Slot';
import { Validator, ValidatorType } from '../validator/Validator';

export type ParamValidation<T> = {
  params: {
    [key in keyof T]: ValidatorType<T[key]>;
  };
};

export class Param extends Slot<Slot.Web, ParamValidation<any>> {
  constructor(rules: Record<string, Validator>) {
    super();
    const parsedRules = Object.entries(rules);

    this.use((ctx, next) => {
      const rawParams: Record<string, any> = ctx._params || {};
      const params: typeof ctx.params = ctx.params = {};

      for (let i = 0; i < parsedRules.length; ++i) {
        const [key, validator] = parsedRules[i]!;
        params[key] = rawParams[key];

        const msg = validator.validate(params, key);
        if (msg) {
          ctx.throw(400, msg);
        }
      }

      return next();
    });
  }
}
