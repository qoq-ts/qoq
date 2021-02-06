import coBody from 'co-body';
import { IncomingForm } from 'formidable';
import { WebContextHelper } from '../core/WebContext';
import { Validator, ValidatorType } from '../validator/Validator';
import { Slot } from './Slot';

export type BodyValidation<T> = {
  request: {
    body: BodyValidation<T>['body'];
  };
  body: {
    [key in keyof T]: ValidatorType<T[key]>;
  };
};

export const Body = (rules: Record<string, Validator>): _Body => {
  return new _Body(rules);
};

export class _Body extends Slot<Slot.Web, BodyValidation<any>> {
  constructor(rules: Record<string, Validator>) {
    super();
    const parsedRules = Object.entries(rules);

    this.use(async (ctx, next) => {
      let rawBody = await this.getBody(ctx);
      const body: typeof ctx.body = ctx.body = ctx.request.body = {};

      for (const [key, validator] of parsedRules) {
        body[key] = rawBody[key];

        const msg = validator.validate(body, key);
        if (msg) {
          ctx.throw(400, msg);
        }
      }

      return next();
    });
  }

  protected async getBody(ctx: WebContextHelper): Promise<Record<string, any>> {
    try {
      if (ctx.request.is('multipart/*')) {
        const form = new IncomingForm({
          multiples: true,
          hash: false,
        });

        return await new Promise((resolve, reject) => {
          form.parse(ctx.request.req, (err, fields, files) => {
            if (err) {
              return reject(err);
            }

            resolve({
              ...fields,
              ...files,
            });
          });
        });
      }

      return coBody(ctx.request.req, {
        returnRawBody: false,
      });
    } catch (e) {
      return ctx.throw(400, e);
    }
  }
}
