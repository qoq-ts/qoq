import chalk from 'chalk';
import EventEmitter from 'events';
import { EOL } from 'os';
import path from 'path';
import util from 'util';
import { setInspector } from '../util/setInspector';
import { ConsoleRouterParser } from './ConsoleRouterParser';
import { ConsoleContext } from './ConsoleContext';
import { ConsoleRouter } from '../router/ConsoleRouter';

interface Options {
  /**
   * @default ./src/commands
   */
  commandsDir?: string | string[];
}

export class ConsoleApplication extends EventEmitter {
  protected readonly routerParser: ConsoleRouterParser;
  protected executingCount: number = 0;

  constructor(options: Options = {}) {
    super();
    const internalDir = path.join(__dirname, '..', 'command');
    const commandsDir = options.commandsDir ?? './src/commands';
    this.routerParser = new ConsoleRouterParser([internalDir].concat(commandsDir));
    setInspector(this);
  }

  public getPaths() {
    return this.routerParser.paths;
  }

  /**
   * Mount router from path or instance
   */
  mountRouter(router: ConsoleRouter | ConsoleRouter[] | string | string[]): this {
    this.routerParser.mountRouter(router);
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

  /**
   *
   * Input command name and options to run specific command. It's useful for testing or explicit purpose
   *
   * Usage:
   *
   * `app.execute()`
   *
   * `app.execute('a:b:c')`
   *
   * `app.execute('a:b', '--color', '--bail')`
   *
   * `app.execute('a:b', '--name', 'Peter', '--age', '15')`
   */
   public async execute(...commands: string[]): Promise<ConsoleContext> {
     const isChildProcess = !!Reflect.get(this.execute, 'isChildProcess');
     Reflect.deleteProperty(this.execute, 'isChildProcess');
    const ctx = new ConsoleContext(
      this,
      commands.length ? commands : process.argv.slice(2),
      isChildProcess,
    );

    try {
      ++this.executingCount;
      await this.routerParser.compose(ctx);

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
    } finally {
      --this.executingCount;
    }

    return ctx;
  }

  protected inspect() {
    return this.toJSON();
  }

  protected toJSON() {
    return {
      paths: this.getPaths(),
      executingCount: this.executingCount,
    };
  }
}
