import coBody from 'co-body';
import { IncomingForm } from 'formidable';
import { WebCtx } from '../core/WebContext';
import { Validator } from '../validator/Validator';

export const bodyParser = (rules: { [key: string]: Validator }) => {
  const parsedRules = Object.entries(rules);

  const respond = async (ctx: WebCtx) => {
    const rawBody = await getRawBody(ctx);
    const body: Record<string, any> = {};

    for (let i = 0; i < parsedRules.length; ++i) {
      const [key, validator] = parsedRules[i]!;

      body[key] = rawBody[key];

      const msg = validator.validate(body, key);
      if (msg) {
        ctx.throw(400, msg);
      }
    }

    return body;
  };

  return (respond.usePromise = true, respond);
};

const getRawBody = (ctx: WebCtx): Promise<Record<string, any>> => {
  // @ts-ignore Pre-parse the unknown content-type data to json.
  const parsed = ctx._parsed_payload;

  if (parsed && typeof parsed === 'object') {
    return JSON.parse(JSON.stringify(parsed));
  }

  try {
    if (ctx.request.is('multipart/*')) {
      const form = new IncomingForm({
        multiples: true,
        hash: false,
      });

      return new Promise((resolve, reject) => {
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
    return ctx.throw(500, e);
  }
}
