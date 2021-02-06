import path from 'path';
import util from 'util';
import { EOL } from 'os';
import { Application } from './Application';
import { ConsoleContext } from './ConsoleContext';
import chalk from 'chalk';
import { Help } from '../slot/Help';
import { ConsoleRouter } from '../router/ConsoleRouter';
import { stringToArray } from '../util/stringToArray';

interface Options {
  routerDir?: string | string[];
}

export class ConsoleApplication extends Application {
  // @ts-ignore It should initialize on super constructor
  protected helper: Help;
  public/*protected*/ isChildProcess: boolean;

  constructor(options: Options = {}) {
    const dir = [
      path.join(__dirname, '..', 'command')
    ].concat(options.routerDir || './src/commands');
    super(dir);
    this.composer.prepend(this.getHelper());
    this.isChildProcess = false;
  }

  /**
   *
   * Input command name and options to run specific command. It's useful for testing or explicit purpose
   *
   * Usage:
   *
   * `app.run()`
   *
   * `app.run('a:b:c')`
   *
   * `app.run('a:b', '--color', '--bail')`
   *
   * `app.run('a:b', '--name', 'Peter', '--age', '15')`
   */
  public async run(...commands: string[]): Promise<ConsoleContext> {
    const ctx = new ConsoleContext(this, commands.length ? commands : process.argv.slice(2));
    const isChildProcess = this.isChildProcess;
    this.isChildProcess = false;

    try {
      await this.composer(ctx);

      if (!ctx.commandMatched) {
        throw new Error(`No command matches "${ctx.command}"`);
      }
    } catch (err) {
      // When dealing with cross-globals a normal `instanceof` check doesn't work properly.
      // See https://github.com/koajs/koa/issues/1466
      // We can probably remove it once jest fixes https://github.com/facebook/jest/issues/2549.
      const isNativeError = Object.prototype.toString.call(err) === '[object Error]' || err instanceof Error;
      if (!isNativeError) {
        err = new TypeError(util.format('non-error thrown: %j', err));
      }

      if (isChildProcess) {
        throw err;
      } else if (this.listenerCount('error')) {
        this.emit('error', err, ctx);
      } else {
        throw err;
      }
    }

    return ctx;
  }

  public on(event: 'error', listener: (err: Error, ctx: ConsoleContext) => void): this;
  public on(event: string | symbol, listener: (...args: any[]) => void): this;
  public on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  public once(event: 'error', listener: (err: Error, ctx: ConsoleContext) => void): this;
  public once(event: string | symbol, listener: (...args: any[]) => void): this;
  public once(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.once(event, listener);
  }

  /**
   * Useful for testing scenario.
   */
  public appendCommands(routers: ConsoleRouter | ConsoleRouter[]): this {
    stringToArray(routers).forEach((router) => {
      this.parseRouters({ default: router });
    });

    return this;
  }

  public onerror(err: Error) {
    // When dealing with cross-globals a normal `instanceof` check doesn't work properly.
    // See https://github.com/koajs/koa/issues/1466
    // We can probably remove it once jest fixes https://github.com/facebook/jest/issues/2549.
    const isNativeError = Object.prototype.toString.call(err) === '[object Error]' || err instanceof Error;
    if (!isNativeError) {
      err = new TypeError(util.format('non-error thrown: %j', err));
    }

    const msgs = (err.stack || err.toString())
      .split(EOL)
      .map((item) => '  ' + item);

    console.error();
    console.error(chalk.red(msgs.shift()));
    console.error(msgs.join(EOL));
    console.error();
  }

  protected getRouterInstance(): new (...args: any[]) => ConsoleRouter {
    return ConsoleRouter;
  }

  protected getHelper(): Help {
    if (!this.helper) {
      this.helper = new Help();
    }

    return this.helper;
  }

  protected parseRouters(modules: Record<string, any>): void {
    super.parseRouters(modules);
    Object.values(modules).forEach((item) => {
      if (item && item instanceof ConsoleRouter) {
        this.getHelper().appendBuilders(item.getBuilders());
      }
    });
  }

  public/*protected*/ inspect() {
    return this.toJSON();
  };

  public/*protected*/ toJSON() {
    return {
      commandsPath: this.getPaths(),
    };
  };
}
