# QOQ
Qoq is a restful node framework with real type checking, a better way to save time and avoid syntax mistake. It's also designed to compatible with [koa2](https://github.com/koajs/koa) which is most popular basic framework, that means the existing middleware of koa2 can be easily integrated into here.

<br>

**🔥 no typescript, no coding.**

<br>

[![License](https://img.shields.io/github/license/qoq-ts/qoq)](https://github.com/qoq-ts/qoq/blob/master/LICENSE)
[![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/qoq-ts/qoq/CI/master)](https://github.com/qoq-ts/qoq/actions)
[![Codecov](https://img.shields.io/codecov/c/github/qoq-ts/qoq)](https://codecov.io/gh/qoq-ts/qoq)
[![npm](https://img.shields.io/npm/v/qoq)](https://www.npmjs.com/package/qoq)

# Features

* web/console router
* validate anything for router
* cache engine
* slot (middleware)
* auto type checking

# Installation

```bash
yarn add qoq
```

# Related Middleware
| Project | Version | Slot for | Description |
| ------- | ------- | ------ | ------ |
| [qoq-sequelize](https://github.com/qoq-ts/qoq-sequelize) | [![npm](https://img.shields.io/npm/v/qoq-sequelize)](https://www.npmjs.com/package/qoq-sequelize) | Web, Console | database ORM (mysql, sqlite, ...) |
| [qoq-redis](https://github.com/qoq-ts/qoq-redis) | [![npm](https://img.shields.io/npm/v/qoq-redis)](https://www.npmjs.com/package/qoq-redis) | Web, Console | redis command, cache extension |
| [qoq-compress](https://github.com/qoq-ts/qoq-compress) | [![npm](https://img.shields.io/npm/v/qoq-compress)](https://www.npmjs.com/package/qoq-compress) | Web | gzip, brotli |
| [qoq-morgan](https://github.com/qoq-ts/qoq-morgan) | [![npm](https://img.shields.io/npm/v/qoq-morgan)](https://www.npmjs.com/package/qoq-morgan) | Web | logger |
| [qoq-cors](https://github.com/qoq-ts/qoq-cors) | [![npm](https://img.shields.io/npm/v/qoq-cors)](https://www.npmjs.com/package/qoq-cors) | Web | CORS |
| [qoq-ratelimit](https://github.com/qoq-ts/qoq-ratelimit) | [![npm](https://img.shields.io/npm/v/qoq-ratelimit)](https://www.npmjs.com/package/qoq-ratelimit) | Web | request rate limiter |
| [qoq-jwt](https://github.com/qoq-ts/qoq-jwt) | [![npm](https://img.shields.io/npm/v/qoq-jwt)](https://www.npmjs.com/package/qoq-jwt) | Web | validating json token |
| [qoq-etag](https://github.com/qoq-ts/qoq-etag) | [![npm](https://img.shields.io/npm/v/qoq-etag)](https://www.npmjs.com/package/qoq-etag) | Web | header: etag |
| [qoq-response-time](https://github.com/qoq-ts/qoq-response-time) | [![npm](https://img.shields.io/npm/v/qoq-response-time)](https://www.npmjs.com/package/qoq-response-time) | Web | header: X-Response-Time |
| [qoq-helmet](https://github.com/qoq-ts/qoq-helmet) | [![npm](https://img.shields.io/npm/v/qoq-helmet)](https://www.npmjs.com/package/qoq-helmet) | Web | security headers |
| [qoq-pretty-json](https://github.com/qoq-ts/qoq-pretty-json) | [![npm](https://img.shields.io/npm/v/qoq-pretty-json)](https://www.npmjs.com/package/qoq-pretty-json) | Web | format JSON |
| [qoq-static](https://github.com/qoq-ts/qoq-static) | [![npm](https://img.shields.io/npm/v/qoq-static)](https://www.npmjs.com/package/qoq-static) | Web | static file serve |
| [qoq-views](https://github.com/qoq-ts/qoq-views) | [![npm](https://img.shields.io/npm/v/qoq-views)](https://www.npmjs.com/package/qoq-views) | Web | template rendering |
| [qoq-json-error](https://github.com/qoq-ts/qoq-json-error) | [![npm](https://img.shields.io/npm/v/qoq-json-error)](https://www.npmjs.com/package/qoq-json-error) | Web | JSON error handler |


# Demos
[Hello World](https://github.com/qoq-ts/demo-qoq-hello-world)

# Usage
### Create web app
```typescript
// src/index.ts
import { WebApplication } from 'qoq';

const app = new WebApplication({
  // mount routers automatically
  routersDir: './src/routers',
});

app.listen(3000, () => {
  console.log('Server started!');
});
```
### Create web slots (middleware)
```typescript
// src/bootstrap/web.ts
import { WebSlotManager, Tree } from 'qoq';
import { Cors } from 'qoq-cors';
import { Redis } from 'qoq-redis';

export const webSlots = WebslotManager
  .use(new Cors())
  .use(new Redis())
  .use((ctx, next) => {
    console.log(ctx.request.ip);
    return next();
  });
export const advancedSlots = webSlots.use(...).use(...);

// the trunk will always run through
// until slot or router interrput it ( by skip execute next() ).
Tree.trunk(advancedSlots);
```
### Create web router
```typescript
// src/routers/index.ts
import { WebRouter, validator } from 'qoq';
import { webSlots } from '../bootstrap/web';

export const router = new WebRouter({
  prefix: '/',
  // slots behind webSlots will be convert to router group slots
  slots: webSlots.use(new CustomSlot()).use(...),
});

router
  .get('/user/:id')
  .params({
    id: validator.number,
  })
  .action(async (ctx, payload) => {
    const userId = payload.params.id; // TS type annotation: number
    const user = await ctx.redis.get(`user-${userId}`);

    !user && ctx.throw(400, 'user not found');
    ctx.body = user;
  });

router
  .get('/users')
  .query({
    // page is required, otherwise a 400 bad-request error will be thrown.
    page: validator.number,
    // pageSize is optional and will set to 10 when data is undefined/null.
    pageSize: validator.number.default(10),
  })
  .action(async (ctx, payload) => {
    // TS type annotation: { page: number; pageSize: number }
    const { page, pageSize } = payload.query;
    const users = await User.findAll({
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });

    ctx.body = users;
  });

router
  .post('/user')
  .body({
    name: validator.string,
    vip: validator.boolean.default(false),
    homepage: validator.url.optional(),
  })
  .action(async (ctx, payload) => {
    // TS type annotation of body: { name: string; vip: boolean; homepage?: string }
    const user = await User.create(payload.body);

    ctx.status = 201;
    ctx.body = user;
  });
```

### Create console app
```typescript
// src/index.ts
import { ConsoleApplication } from 'qoq';

const app = new ConsoleApplication({
  // mount routers automatically
  commandsDir: './src/commands',
});

app.run();
```

### Create console router
```typescript
// src/commands/index.ts
import { ConsoleRouter, validator } from 'qoq';
import { webSlots } from '../bootstrap/web';

export const router = new ConsoleRouter({
  prefix: '/',
  slots: consoleSlots
    // as router group slots
    .use(new CustomSlot()),
});

router
  .command('my:schedule')
  .options({
    dateFrom: validator.string.optional(),
    dateTo: validator.string.optional(),
  })
  .alias({
    dateFrom: 'f',
    dateTo: 't',
  })
  .action(async (ctx, payload) => {
    // TS type annotation: { dateFrom?: string; dateTo?: string }
    const { dateFrom, dateTo } = payload.options;

    // ...your business
    console.log('Done!');
  });
```
You can execute this command like this:
```bash
npx qoq my:schedule
# or
npx qoq my:schedule --dateFrom '..' --dateTo '..'
# or
npx qoq my:schedule -f '..' -t '..'
```
For testing, feel free to execute command as follows:
```typescript
test ('can do something', async () => {
  const app = new ConsoleApplication();
  const ctx = await app.execute('my:schedule', '-f', '..', '-t', '..');
  expect(...);
});
```

### Cli
```bash
npx qoq -h
# or
yarn qoq -h
# or
node ./src/console.js -h
# or
ts-node ./src/console.ts -h
```
