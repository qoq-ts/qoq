import yargs from 'yargs';
import { ConsoleCtx } from '../core/ConsoleContext';
import { Validator } from '../validator/Validator';

export const optionParser = (rules: { [key: string]: Validator }) => {
  const parsedRules = Object.entries(rules);
  let aliases: Record<string, string> | undefined;

  const respond = async (ctx: ConsoleCtx) => {
    const input = yargs([]).help(false).version(false);

    if (aliases) {
      Object.entries(aliases).forEach(([alias, name]) => {
        input.options(name, {
          alias,
        });
      });
    }

    const { _, $0, ...rawOptions } = input.parseSync(ctx.argv);
    const options: Record<string, any> = {};

    for (const [key, validator] of parsedRules) {
      options[key] = rawOptions[key];

      const msg = await validator.validate(options, key);
      if (msg) {
        throw new Error(msg);
      }
    }

    return options;
  };

  respond.setAlias = (alias: Record<string, string>) => (aliases = alias);
  respond.getAlias = () => aliases;
  respond.getRules = () => rules;

  return respond;
};
