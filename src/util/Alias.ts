export class Alias<T> {
  protected readonly fn: new (...args: any[]) => T;

  constructor(fn: new (...args: any[]) => T) {
    this.fn = fn;
  }

  access(alias: string, from: keyof T, isMethod: boolean = false): this {
    this.check(alias, from);

    return this.getter(alias, from, isMethod).setter(alias, from, isMethod);
  }

  method(alias: string, from: keyof T): this {
    this.check(alias, from);

    this.fn.prototype[alias] = function(...args: any[]) {
      return this[from](...args);
    };

    return this;
  }

  getter(alias: string, from: keyof T, isMethod: boolean = false): this {
    this.check(alias, from);

    this.fn.prototype.__defineGetter__(alias, function(this: Record<keyof T, any>) {
      if (isMethod) {
        return this[from]();
      }

      return this[from];
    });

    return this;
  }

  setter(alias: string, from: keyof T, isMethod: boolean = false): this {
    this.check(alias, from);

    this.fn.prototype.__defineSetter__(alias, function(this: Record<keyof T, any>, val: any) {
      if (isMethod) {
        this[from](val);
      } else {
        this[from] = val;
      }
    });

    return this;
  }

  protected check(alias: string , from: keyof T) {
    if (alias === from) {
      throw new Error('You are setting alias with same property.');
    }
  }
}
