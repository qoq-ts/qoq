import chalk from 'chalk';
import path from 'path';
import glob from 'glob';
import yargs from 'yargs/yargs';
import { Slot } from './Slot';
import { ConsoleBuilder } from '../router/ConsoleBuilder';
import { getVersion } from '../util/getVersion';
import { ConsoleRouter } from '../router/ConsoleRouter';
import { stringToArray } from '../util/stringToArray';

export class Help extends Slot<Slot.Console> {
  protected builders: ConsoleBuilder[] = [];

  constructor() {
    super();
    this.use((ctx, next) => {
      if (ctx.command === '') {
        if (ctx.argv.some((argv) => argv === '--version' || argv === '-v')) {
          console.log(getVersion());
        } else {
          this.showAllHelp(ctx.app.getPaths());
        }

        ctx.commandMatched = true;
        return;
      }

      if (ctx.argv.some((argv) => argv === '--help' || argv === '-h')) {
        for (let i = 0; i < this.builders.length; ++i) {
          const builder = this.builders[i]!;
          if (builder.match(ctx.command)) {
            const options = builder.commandOptions.getData();

            if (
              !options['help'] && ctx.argv.includes('--help') ||
              !options['h'] && ctx.argv.includes('-h')
            ) {
              this.showCustomHelp(builder);
              ctx.commandMatched = true;
              return;
            }
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

    Object.entries(builder.commandOptions.getData()).forEach(([key, validator]) => {
      const alias = builder.commandOptions.getAlias()[key];
      const options = validator.toJSON();

      cli.option(options.name || key, {
        alias: alias === undefined ? undefined : stringToArray(alias),
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
