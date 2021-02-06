import util from 'util';

export const setInspector = (instance: object) => {
  if (util.inspect.custom) {
    // @ts-expect-error
    instance[util.inspect.custom] = instance.inspect;
  }
};
