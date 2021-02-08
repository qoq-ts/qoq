import { Action } from '../slot/Action';
import { CommandOption, OptionValidation } from '../slot/CommandOption';
import { ConsoleSlotCtx, Slot } from '../slot/Slot';
import { SlotManager } from '../slot/SlotManager';
import { Validator } from '../validator/Validator';
import { Builder } from './Builder';

interface Document {
  description: string;
}

export class ConsoleBuilder<Props = any, State = any, Alias extends string = ''> extends Builder<Slot.Mix | Slot.Console, Props, State> {
  public/*protected*/ readonly commands: string[];
  public/*protected*/ isShow: boolean = false;
  public/*protected*/ commandOptions = CommandOption();
  public/*protected*/ readonly document: Document = {
    description: '',
  };

  constructor(prefix: string, commands: string[]) {
    super();
    this.commands = commands.map((item) => prefix + item);
  }

  public use<P, S>(
    slot: Slot<Slot.Mix | Slot.Console, P, S> | SlotManager<Slot.Mix | Slot.Console, P, S>
  ): ConsoleBuilder<Props & P, State & S> {
    this.slots = this.slots.use(slot);
    return this;
  }

  public options<T extends { [key: string]: Validator }>(options: T): ConsoleBuilder<Props & OptionValidation<T>, State, Exclude<keyof T, symbol | number>> {
    this.use(this.commandOptions);
    this.commandOptions.setData(options);
    // @ts-expect-error
    return this;
  }

  public action<P = {}, S = {}>(fn: ConsoleSlotCtx<Props & P, State & S>): ConsoleBuilder<Props & P, State & S> {
    this.use(new Action(fn));
    return this;
  }

  public docs(document: Document): this {
    Object.assign(this.document, document);
    return this;
  }

  public alias(optionAlias: { [key in Alias]?: string | string[] }): this {
    this.commandOptions.setAlias(optionAlias);
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
    return {};
  }
}
