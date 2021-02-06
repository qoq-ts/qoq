import { Slot } from './Slot';
import { Validator, ValidatorType } from '../validator/Validator';

export type ParamValidation<T> = {
  request: {
    params: ParamValidation<T>['params'];
  };
  params: {
    [key in keyof T]: ValidatorType<T[key]>;
  };
};

export const Param = (rules: Record<string, Validator>): _Param => {
  return new _Param(rules);
};

export class _Param extends Slot<Slot.Web, ParamValidation<any>> {
  constructor(rules: Record<string, Validator>) {
    super();
    const parsedRules = Object.entries(rules);

    this.use((ctx, next) => {
      const { rawParams } = ctx.request;
      const params: typeof ctx.params = ctx.params = ctx.request.params = {};

      for (const [key, validator] of parsedRules) {
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
