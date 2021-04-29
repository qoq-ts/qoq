import { WebCtx } from '../core/WebContext';
import { Validator } from '../validator/Validator';

export const paramParser = (rules: { [key: string]: Validator }) => {
  const parsedRules = Object.entries(rules);

  const respond = async (ctx: WebCtx<{ params: { [key: string]: unknown } }>) => {
    const rawParams: Record<string, any> = ctx.params || {};
    const params: typeof ctx.params = {};

    for (let i = 0; i < parsedRules.length; ++i) {
      const [key, validator] = parsedRules[i]!;
      params[key] = rawParams[key];

      const msg = await validator.validate(params, key);
      if (msg) {
        ctx.throw(400, msg);
      }
    }

    return params;
  };

  return respond;
};
