declare module 'delegates' {
  export default class Delegates {
    constructor(proto: object, target: string);

    method(name: string): this;
    access(name: string): this;
    getter(name: string): this;
    setter(name: string): this;
    fluent(name: string): this;
  }
}
