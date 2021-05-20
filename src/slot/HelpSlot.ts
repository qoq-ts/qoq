import chalk from 'chalk';
import yargs from 'yargs/yargs';
import { Slot } from './Slot';
import { ConsoleBuilder } from '../router/ConsoleBuilder';
import { version } from '../util/version';
import { ConsoleRouter } from '../router/ConsoleRouter';
import { finder } from '../util/finder';

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
          return this.showAllHelp(ctx.app.getPathPattern(), ctx.app.scriptName);
        }

        return;
      }

      if (ctx.options['help'] || ctx.options['h']) {
        for (let i = 0; i < this.builders.length; ++i) {
          const builder = this.builders[i]!;
          if (builder.match(ctx.command)) {
            this.showCustomHelp(builder, ctx.app.scriptName);
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

  protected async showAllHelp(commandsPath: finder.Options[], scriptName: string) {
    const cli = yargs([])
      .scriptName(scriptName)
      .usage(`${scriptName} [command] [options] [--help|-h]`)
      .describe('version', `Show ${scriptName} version number`)
      .alias('v', 'version')
      .alias('h', 'help');

    const matches = await finder(commandsPath);

    await Promise.all(
      matches.map(async (file) => {
        const modules = await import(file);

        Object.values(modules).forEach((item) => {
          if (item && item instanceof ConsoleRouter) {
            item.getBuilders().forEach((builder) => {
              const json = builder.toJSON();

              if (json.showInHelp) {
                json.commands[0] = chalk.yellow(json.commands[0]);
                cli.command(json.commands, json.description);
              }
            });
          }
        });
      }),
    );

    cli.showHelp('log');
  }

  protected showCustomHelp(builder: ConsoleBuilder, scriptName: string) {
    const json = builder.toJSON();

    const cli = yargs([])
      .scriptName(scriptName)
      .usage(
        `${scriptName} ${json.commands[0]} [options]${
          json.description ? '\n\n' + chalk.bold(json.description) : ''
        }`,
      )
      .version(false)
      .help(false);

    Object.entries(json.options).forEach(([, option]) => {
      cli.option(option.label, {
        alias: option.alias,
        description: option.description,
        default: option.defaultValue === '' ? undefined : option.defaultValue,
      });
    });

    // Show help option last
    cli.alias('help', 'h').describe('help', 'Show help for command ' + json.commands[0]);

    cli.showHelp('log');
  }
}
