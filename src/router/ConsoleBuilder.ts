import { Next } from 'koa';
import { ConsoleCtx } from '../core/ConsoleContext';
import { optionParser } from '../parser/optionParser';
import { Slot } from '../slot/Slot';
import { Use } from '../slot/SlotManager';
import { Validator, ValidatorTypes } from '../validator/Validator';
import { Builder } from './Builder';

export class ConsoleBuilder<
  Props = any,
  State = any,
  Alias extends string = '',
  Payload extends { [key: string]: object } = {},
> extends Builder<Slot.Mix | Slot.Console, Props, State, Payload> {
  protected readonly commands: string[];
  protected show?: boolean;
  protected optionRules: Record<string, Validator> = {};
  protected desc?: string;

  public declare /*protected*/ payload: {
    options?: ReturnType<typeof optionParser>;
  };

  constructor(prefix: string, commands: string[]) {
    super();
    this.commands = commands.map((item) => prefix + item);
  }

  public declare use: <P, S>(
    slot: Use<Slot.Mix | Slot.Console, P, S>,
  ) => ConsoleBuilder<Props & P, State & S, Alias, Payload>;

  public options<T extends { [key: string]: Validator }>(
    options: T,
  ): ConsoleBuilder<
    Props,
    State,
    Exclude<keyof T, symbol | number>,
    Omit<Payload, 'options'> & { options: ValidatorTypes<T> }
  > {
    this.optionRules = options;
    this.payload.options = optionParser(options);
    // @ts-expect-error
    return this;
  }

  public action<P = {}, S = {}>(
    fn: (
      ctx: ConsoleCtx<Props & P, State & S>,
      payload: Payload,
      next: Next,
    ) => any,
  ): ConsoleBuilder<Props & P, State & S, Alias, Payload> {
    this.useAction(fn);
    return this;
  }

  public description(desc: string): this {
    this.desc = desc;
    return this;
  }

  public alias(optionAlias: { [key: string]: Alias }): this {
    this.payload.options?.setAlias(optionAlias);
    return this;
  }

  public showInHelp(show: boolean = true): this {
    this.show = show;
    return this;
  }

  public /*protected*/ match(command: string): boolean {
    return this.commands.includes(command);
  }

  public /*protected*/ toJSON() {
    const optionsData = this.payload.options?.getRules() || {};
    const aliases = Object.entries(this.payload.options?.getAlias() || {});

    return {
      commands: this.commands,
      description: this.desc || '',
      showInHelp: this.show === true,
      options: Object.entries(optionsData).map(([key, validator]) => {
        const aliasList = aliases.filter(([, v]) => v === key).map(([k]) => k);
        const options = validator.toJSON();

        return {
          ...options,
          alias: aliasList.length ? aliasList : undefined,
          label: options.label || key,
        };
      }),
    };
  }
}
