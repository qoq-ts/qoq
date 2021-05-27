import yargs from 'yargs';
import { setInspector } from '../util/setInspector';
import { ConsoleApplication } from './ConsoleApplication';

export type ConsoleCtx<Props = {}, State = {}> = ConsoleContext<Props, State> & Props;

export class ConsoleContext<_Props = {}, State = {}> {
  public readonly state: State & { [key: string]: unknown } = {} as any;
  public readonly app: ConsoleApplication;
  public readonly command: string;
  public readonly commands: readonly string[];
  public readonly options: { [key: string]: unknown };
  public readonly argv: readonly string[];
  public isChildProcess: boolean;

  public /*protected*/ commandMatched = false;

  constructor(app: ConsoleApplication, argv: string[], isChildProcess: boolean) {
    this.app = app;
    this.argv = argv;
    const { $0, _: commands, ...options } = yargs([]).help(false).version(false).parseSync(argv);
    this.commands = commands.map(String);
    this.command = this.commands[0] || '';
    this.options = options;
    this.isChildProcess = isChildProcess;
    setInspector(this);
  }

  /**
   *
   * Input command name and options to run specific command.
   *
   * In commands or plugins, you are recommended to use `ctx.run` instead of `ctx.app.execute`.
   * The largest difference is `ctx.app.execute` will not throw error when `app.on('error', fn)` is registered.
   *
   * Usage:
   *
   * `ctx.execute()`
   *
   * `ctx.execute('a:b:c')`
   *
   * `ctx.execute('a:b', '--color', '--bail')`
   *
   * `ctx.execute('a:b', '--name', 'Peter', '--age', '15')`
   */
  public execute(...commands: string[]): Promise<ConsoleContext> {
    Reflect.set(this.app.execute, 'isChildProcess', true);
    return this.app.execute(...commands);
  }

  protected toJSON() {
    return {
      app: this.app,
      command: this.command,
      options: this.options,
      argv: this.argv,
      isChildProcess: this.isChildProcess,
    };
  }

  protected inspect() {
    return this.toJSON();
  }
}
