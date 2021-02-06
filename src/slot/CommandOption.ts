import yargs from 'yargs/yargs';
import { Slot } from './Slot';
import { ValidatorType, Validator } from '../validator/Validator';

export type OptionValidation<T> = {
  options: {
    [key in keyof T]: ValidatorType<T[key]>;
  };
};

export const CommandOption = (): _CommandOption => {
  return new _CommandOption();
};

export class _CommandOption extends Slot<Slot.Console, OptionValidation<any>> {
  protected data: Record<string, Validator> = {};
  protected aliases: Record<string, undefined | string | string[]> = {};

  constructor() {
    super();

    this.use((ctx, next) => {
      const input = yargs([]).help(false).version(false);

      if (this.aliases) {
        Object.entries(this.aliases).forEach(([name, alias]) => {
          input.options(name, {
            alias,
          });
        });
      }

      const { _, $0, ...rawOptions } = input.parse(ctx.argv);

      ctx.options = {};

      for (const [key, validator] of Object.entries(this.data)) {
        ctx.options[key] = rawOptions[key];

        const msg = validator.validate(ctx.options, key);
        if (msg) {
          throw new Error(msg);
        }
      }

      return next();
    });
  }

  public setData(data: Record<string, Validator>) {
    this.data = data;
  }

  public setAlias(aliases: Record<string, undefined | string | string[]>) {
    this.aliases = aliases;
  }

  public getData() {
    return this.data;
  }

  public getAlias() {
    return this.aliases;
  }
}
