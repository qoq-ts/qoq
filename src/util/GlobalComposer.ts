import chalk from 'chalk';
import { Slot } from '../slot/Slot';
import { compose, Composer } from './compose';

export class GlobalComposer {
  protected readonly global: Composer = compose([]);
  protected readonly locals: Composer[] = [];
  protected initialized: boolean = false;

  public getGlobal(): Composer {
    return this.global;
  }

  public compare(plugins: Slot[]): Composer {
    const localComposer = compose([]);
    const globals = this.global.get();

    if (!this.initialized) {
      this.initialized = true;
      this.global.set(plugins.slice());
      localComposer.set([]);
    } else {
      const diffIndex = globals.findIndex((item, index) => item !== plugins[index]);

      if (diffIndex >= 0) {
        this.global.set(globals.slice(0, diffIndex));
        localComposer.set(plugins.slice(diffIndex));

        const fallbackToLocals = globals.slice(diffIndex);

        this.locals.forEach((local) => {
          local.prepend(...fallbackToLocals);
        });

        console.warn(chalk.yellowBright.bold(`[Warning] There are some global plugins fallback to locals, check your code since that's not expected.`));
      } else {
        localComposer.set(plugins.slice(globals.length));
      }
    }

    this.locals.push(localComposer);

    return localComposer;
  }
}
