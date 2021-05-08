import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';
import chalk from 'chalk';
import { ConsoleRouter } from '../router/ConsoleRouter';
import { ConsoleSlotManager } from '../slot/SlotManager';
import { validator } from '../validator';
import { WebRouter } from '../router/WebRouter';
import { WebRouterSchema } from '../router/WebBuilder';
import { finder } from '../util/finder';

export const router = new ConsoleRouter({
  slots: new ConsoleSlotManager(),
});

router
  .command('export:routers')
  .showInHelp()
  .description('Export web routers to file and `ctx.state.routers`')
  .options({
    input: validator.array
      .item(validator.string)
      .minItemLength(1)
      .default([finder.resolve('./src/routers/')])
      .document({
        description: 'The folders where web routers come from',
      }),
    ignore: validator.array
      .item(validator.string)
      .default([])
      .document({
        description: 'ignore router files',
      }),
    output: validator
      .string
      .default('./routers.json')
      .document({
        description: 'The file path JSON data will output to.',
      }),
    format: validator
      .boolean
      .default(false)
      .document({
        description: 'Format the json schema to make it readdable',
      }),
  })
  .alias({
    i: 'input',
    o: 'output',
    f: 'format',
    n: 'ignore',
  })
  .action(async (ctx, payload) => {
    let { input, ignore, output, format } = payload.options;
    const routers: WebRouterSchema[] = [];
    const now = Date.now();

    const matches = await finder({
      pattern: input,
      ignore,
    });

    await Promise.all(
      matches.map(async (matchPath) => {
        const modules = await import(matchPath);
        console.log('Parsing path: ' + matchPath);

        return Promise.all(
          Object.values(modules).map(async (item) => {
            if (item && item instanceof WebRouter) {
              for (let builder of item.builders) {
                routers.push(await builder.toJSON());
              }
            }
            return;
          })
        );
      })
    );

    output = path.resolve(output);
    const dir = path.dirname(output);
    if (!fs.existsSync(dir)) {
      mkdirp.sync(dir);
    }

    fs.writeFileSync(output, JSON.stringify(routers, null, format ? 4 : undefined));
    Object.assign(ctx.state, {
      routers,
    });

    console.log(chalk.bold.greenBright(`[${Date.now() - now}ms] Output to: `) + output);
  });
