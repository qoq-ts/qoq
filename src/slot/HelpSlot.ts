import chalk from 'chalk';
import path from 'path';
import glob from 'glob';
import yargs from 'yargs/yargs';
import { Slot } from './Slot';
import { ConsoleBuilder } from '../router/ConsoleBuilder';
import { version } from '../util/version';
import { ConsoleRouter } from '../router/ConsoleRouter';
import { toArray } from '../util/toArray';

export class HelpSlot extends Slot<Slot.Console> {
  protected builders: ConsoleBuilder[] = [];

  constructor() {
    super();
    this.use((ctx, next) => {
      if (ctx.command === '') {
        ctx.commandMatched = true;

        if (ctx.options['version'] || ctx.options['v']) {
          console.log(version);
        } else {
          this.showAllHelp(ctx.app.getPaths());
        }

        return;
      }

      if (ctx.options['help'] || ctx.options['h']) {
        for (let i = 0; i < this.builders.length; ++i) {
          const builder = this.builders[i]!;
          if (builder.match(ctx.command)) {
            this.showCustomHelp(builder);
            ctx.commandMatched = true;
            return;
          }
        }
      }

      return next();
    });
  }

  public appendBuilders(builders: ConsoleBuilder[]): this {
    this.builders.push(...builders);
    return this;
  }

  protected showAllHelp(commandsPath: string[]) {
    const scriptName = 'qoq';

    const cli = yargs([])
      .scriptName(scriptName)
      .usage(`${scriptName} [command] [options] [--help|-h]`)
      .describe('version', `Show ${scriptName} version number`)
      .alias('v', 'version')
      .alias('h', 'help');

    commandsPath.forEach((item) => {
      glob.sync(path.resolve(item, '**/!(*.d).{ts,js}')).forEach((matchPath) => {
        const modules = require(matchPath);
        Object.values(modules).forEach((moduleItem) => {
          if (moduleItem && moduleItem instanceof ConsoleRouter) {
            moduleItem.getBuilders().forEach((builder) => {
              if (builder.isShow) {
                builder.commands[0] = chalk.yellow(builder.commands[0]);
                cli.command(builder.commands, builder.document.description);
              }
            });
          }
        });
      });
    });

    cli.showHelp('log');
  }

  protected showCustomHelp(builder: ConsoleBuilder) {
    const { description } = builder.document;

    const cli = yargs([])
      .scriptName('qoq')
      .usage(`qoq ${builder.commands[0]} [options]${description  ? '\n\n' + chalk.bold(description) : ''}`)
      .version(false)
      .help(false);

    const aliases = builder.payload.options?.getAlias();

    Object.entries(builder.payload.options?.getRules() || {}).forEach(([key, validator]) => {
      const alias = aliases?.[key];
      const options = validator.toJSON();

      cli.option(options.name || key, {
        alias: alias === undefined ? undefined : toArray(alias),
        description: options.description,
        default: options.defaultValue === '' ? undefined : options.defaultValue,
      });
    });

    // Show help option last
    cli
      .alias('help', 'h')
      .describe('help', 'Show help for command ' + builder.commands[0])

    cli.showHelp('log');
  }
}
