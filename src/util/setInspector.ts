import { inspect } from 'util';

export const setInspector = (instance: object) => {
  if (inspect.custom) {
    // @ts-expect-error
    instance[inspect.custom] = instance.inspect.bind(instance);
  }
};
