import qs from 'qs';
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

    this.use((ctx, next) => {
      const rawQuery = qs.parse(ctx.request.querystring);
      const query: typeof ctx.query = ctx.query = ctx.request.query = {};

      for (const [key, validator] of parsedRules) {
        query[key] = rawQuery[key];

        const msg = validator.validate(query, key);
        if (msg) {
          ctx.throw(400, msg);
        }
      }

      return next();
    });
  }
}
