import { Validator, ValidatorType } from '../validator/Validator';
import { Slot } from './Slot';

export type QueryValidation<T> = {
  request: {
    query: QueryValidation<T>['query'];
  };
  query: {
    [key in keyof T]: ValidatorType<T[key]>;
  };
};

export class Query extends Slot<Slot.Web, QueryValidation<any>> {
  constructor(rules: Record<string, Validator>) {
    super();
    const parsedRules = Object.entries(rules);

    this.use(async (ctx, next) => {
      const rawQuery: Record<string, any> = ctx.request.rawQuery;
      const query: typeof ctx.request.query = {};

      for (let i = 0; i < parsedRules.length; ++i) {
        const [key, validator] = parsedRules[i]!;

        query[key] = rawQuery[key];

        const msg = validator.validate(query, key);
        if (msg) {
          ctx.throw(400, msg);
        }
      }

      // ctx.query has been delegated.
      Object.defineProperty(ctx.request, 'query', {
        get: () => query,
        enumerable: true,
        configurable: true,
      });

      await next();

      Object.defineProperty(ctx.request, 'query', {
        get: () => ctx.request.rawQuery,
        enumerable: true,
        configurable: true,
      });
    });
  }
}
