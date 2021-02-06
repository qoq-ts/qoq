import yargs from 'yargs/yargs';
import { Context } from './Context';
import { ConsoleApplication } from './ConsoleApplication';

export type ConsoleContextHelper<Props = {}, State = {}> = ConsoleContext<Props, State> & Props;

export class ConsoleContext<Props = {}, State = {}> extends Context<Props, State> {
  public readonly app: ConsoleApplication;
  public readonly command: string;
  public/*private*/ commandMatched = false;
  public/*protected*/ readonly argv: string[];

  constructor(app: ConsoleApplication, argv: string[]) {
    super();
    this.app = app;
    this.argv = argv;
    this.command = (yargs([]).help(false).version(false).parse(argv)._[0] || '').toString();
  }

  /**
   *
   * Input command name and options to run specific command.
   *
   * In commands or plugins, you are recommended to use `ctx.run` instead of `ctx.app.run`.
   * The largest difference is `ctx.app.run` will not throw error when `app.on('error', fn)` is registered.
   *
   * Usage:
   *
   * `ctx.run()`
   *
   * `ctx.run('a:b:c')`
   *
   * `ctx.run('a:b', '--color', '--bail')`
   *
   * `ctx.run('a:b', '--name', 'Peter', '--age', '15')`
   */
  async run(...commands: string[]): Promise<ConsoleContext> {
    this.app.isChildProcess = true;
    return this.app.run(...commands);
  }

  public/*protected*/ inspect() {
    return this.toJSON();
  }

  public/*protected*/ toJSON() {
    return {
      app: this.app.toJSON(),
      command: this.command,
      argv: this.argv,
    };
  }
}
