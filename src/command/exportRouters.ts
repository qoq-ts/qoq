import path from 'path';
import fs from 'fs';
import glob from 'glob';
import mkdirp from 'mkdirp';
import chalk from 'chalk';
import { ConsoleRouter } from '../router/ConsoleRouter';
import { ConsoleSlotManager } from '../slot/SlotManager';
import { validator } from '../validator';
import { WebRouter } from '../router/WebRouter';
import { WebRouterSchema } from '../router/WebBuilder';

export const router = new ConsoleRouter({
  slots: new ConsoleSlotManager(),
});

router
  .command('export:routers')
  .showInHelp()
  .description('Export web routers to file and `ctx.state.routers`')
  .options({
    input: validator.array.each(validator.string).minItemLength(1).document({
      description: 'The folders where web routers come from',
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
  })
  .action(async (ctx, payload) => {
    let { input, output, format } = payload.options;
    const routers: WebRouterSchema[] = [];
    const now = Date.now();

    output = path.resolve(output);

    await Promise.all(
      input.map((dir) => {
        return Promise.all(
          glob.sync(path.resolve(dir, '**/!(*.d).{ts,js}')).map(async (matchPath) => {
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
      }),
    );

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
