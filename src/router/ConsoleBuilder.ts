import { Next } from 'koa';
import { ConsoleCtx } from '../core/ConsoleContext';
import { optionParser } from '../parser/optionParser';
import { Slot } from '../slot/Slot';
import { Use } from '../slot/SlotManager';
import { Validator, ValidatorTypes } from '../validator/Validator';
import { Builder } from './Builder';

interface Document {
  description: string;
}

export class ConsoleBuilder<
  Props = any,
  State = any,
  Alias extends string = '',
  Payload extends { [key: string]: object } = {}
> extends Builder<Slot.Mix | Slot.Console, Props, State, Payload> {
  public/*protected*/ readonly commands: string[];
  public/*protected*/ isShow: boolean = false;
  protected optionRules: Record<string, Validator> = {};
  public/*protected*/ readonly document: Document = {
    description: '',
  };

  public/*protected*/ declare payload: {
    options?: ReturnType<typeof optionParser>;
  };

  constructor(prefix: string, commands: string[]) {
    super();
    this.commands = commands.map((item) => prefix + item);
  }

  public declare use: <P, S>(slot: Use<Slot.Mix | Slot.Console, P, S>) => ConsoleBuilder<Props & P, State & S, Alias, Payload>;

  public options<T extends { [key: string]: Validator }>(options: T): ConsoleBuilder<Props, State, Exclude<keyof T, symbol | number>, Omit<Payload, 'options'> & { options: ValidatorTypes<T> }> {
    this.optionRules = options;
    this.payload.options = optionParser(options);
    // @ts-expect-error
    return this;
  }

  public action<P = {}, S = {}>(fn: (ctx: ConsoleCtx<Props & P, State & S>, payload: Payload, next: Next) => any): ConsoleBuilder<Props & P, State & S, Alias, Payload> {
    this.useAction(fn);
    return this;
  }

  public docs(document: Document): this {
    Object.assign(this.document, document);
    return this;
  }

  public alias(optionAlias: { [key: string]: Alias }): this {
    this.payload.options?.setAlias(optionAlias);
    return this;
  }

  public showInHelp(show: boolean = true): this {
    this.isShow = show;
    return this;
  }

  public/*protected*/ match(command: string): boolean {
    return this.commands.includes(command);
  }

  public/*protected*/ toJSON() {
    const optionsData = this.payload.options?.getRules() || {};
    const aliases = this.payload.options?.getAlias() || {};

    return {
      commands: this.commands,
      description: this.document.description || '',
      showInHelp: this.isShow,
      options: Object.entries(optionsData).map(([key, validator]) => {
        const alias = aliases[key];
        const options = validator.toJSON();

        return {
          alias: alias === undefined
            ? undefined
            : Array.isArray(alias) ? alias : [alias],
          ...options,
          name: options.name || key,
        };
      }),
    };
  }
}
