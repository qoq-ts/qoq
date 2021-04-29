import { WebCtx } from '../core/WebContext';
import { Validator } from '../validator/Validator';

export const queryParser = (rules: { [key: string]: Validator }) => {
  const parsedRules = Object.entries(rules);

  const respond = async (ctx: WebCtx) => {
    const rawQuery: Record<string, any> = ctx.request.query;
    const query: typeof ctx.query = {};

    for (let i = 0; i < parsedRules.length; ++i) {
      const [key, validator] = parsedRules[i]!;
      query[key] = rawQuery[key];

      const msg = await validator.validate(query, key);
      if (msg) {
        ctx.throw(400, msg);
      }
    }

    return query;
  };

  return respond;
};

queryParser.usePromise = false;
