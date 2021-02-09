import coBody from 'co-body';
import { IncomingForm } from 'formidable';
import { WebCtx } from '../core/WebContext';
import { Validator, ValidatorType } from '../validator/Validator';
import { Slot } from './Slot';

/**
 * Koa has kept `ctx.body`, it equivalent to `ctx.response.body`.
 * It's boring to retrieve data from `ctx.request.body` without alias, so why not change property name?
 */
export type PayloadValidation<T> = {
  request: {
    payload: PayloadValidation<T>['payload'];
    /**
     * An alias of payload, compatible with koa2
     */
    body: PayloadValidation<T>['payload'];
  };
  payload: {
    [key in keyof T]: ValidatorType<T[key]>;
  }
};

export class Payload extends Slot<Slot.Web, PayloadValidation<any>> {
  constructor(rules: Record<string, Validator>) {
    super();
    const parsedRules = Object.entries(rules);

    this.use(async (ctx, next) => {
      const rawPayload = await this.getRawPayload(ctx);
      const payload: typeof ctx.payload =ctx.request.body = ctx.request.payload = ctx.payload = {};

      for (let i = 0; i < parsedRules.length; ++i) {
        const [key, validator] = parsedRules[i]!;

        payload[key] = rawPayload[key];

        const msg = validator.validate(payload, key);
        if (msg) {
          ctx.throw(400, msg);
        }
      }

      return next();
    });
  }

  protected async getRawPayload(ctx: WebCtx): Promise<Record<string, any>> {
    // @ts-ignore Pre-parse the unknown content-type data to json.
    const parsed = ctx._parsed_payload_;

    if (parsed && typeof parsed === 'object') {
      return JSON.parse(JSON.stringify(parsed));
    }

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
