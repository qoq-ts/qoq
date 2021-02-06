import path from 'path';
import fs from 'fs';
import glob from 'glob';
import mkdirp from 'mkdirp';
import chalk from 'chalk';
import { createConsoleRouter } from '../router/ConsoleRouter';
import { ConsoleSlotManager } from '../slot/SlotManager';
import { rule } from '../validator';
import { WebRouter } from '../router/WebRouter';

export const router = createConsoleRouter(ConsoleSlotManager);

router
  .command('export:routers')
  .showInHelp()
  .docs({
    description: 'Export web routers to file and `ctx.state.routes`',
  })
  .options({
    sourceDir: rule.array.each(rule.string).minItemLength(1).docs({
      description: 'The folders where web routers come from',
    }),
    output: rule
      .string
      .default('./routers.json')
      .docs({
        description: 'The file path JSON data will output to.',
      }),
  })
  .alias({
    sourceDir: 'd',
    output: 'o',
  })
  .action((ctx) => {
    let { sourceDir, output } = ctx.options;
    const routers: object[] = [];
    const now = Date.now();

    output = path.resolve(output);

    sourceDir.forEach((dir) => {
      glob.sync(path.resolve(dir, '**/!(*.d).{ts,js}')).forEach((matchPath) => {
        const modules = require(matchPath);
        console.log('Parsing path: ' + matchPath);

        Object.values(modules).forEach((item) => {
          if (item && item instanceof WebRouter) {
            item.builders.forEach((builder) => {
              routers.push(builder.toJSON());
            });
          }
        });
      });
    });

    const dir = path.dirname(output);
    if (!fs.existsSync(dir)) {
      mkdirp.sync(dir);
    }

    fs.writeFileSync(output, JSON.stringify(routers, null, 4));
    Object.assign(ctx.state, {
      routes: routers,
    });

    console.log(chalk.bold.greenBright(`[${Date.now() - now}ms] Output to: `) + output);
  });
