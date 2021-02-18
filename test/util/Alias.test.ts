import { Alias } from '../../src/util/Alias';

describe('Alias', () => {
  it ('can set method alias', () => {
    class A {
      public name = 'world';

      m_hi() {
        return this.name;
      }
    }

    const a = new A();
    // @ts-expect-error
    expect(a.hello).toEqual(undefined);
    expect(a.m_hi()).toEqual(a.name);

    new Alias(A).method('hello', 'm_hi');
    // @ts-expect-error
    expect(typeof a.hello).toEqual('function');
    // @ts-expect-error
    expect(a.hello()).toEqual(a.name);
  });

  it ('can set getter alias', () => {
    class A {
      public name = 'world';

      get g_hi() {
        return this.name;
      }
    }

    const a = new A();
    // @ts-expect-error
    expect(a.hello).toEqual(undefined);
    expect(a.g_hi).toEqual(a.name);

    new Alias(A).getter('hello', 'g_hi');
    // @ts-expect-error
    expect(a.hello).toEqual(a.name);
  });

  it ('can set getter alias with method', () => {
    class A {
      public name = 'world';

      m_hi() {
        return this.name;
      }
    }

    const a = new A();
    // @ts-expect-error
    expect(a.hello).toEqual(undefined);
    expect(a.m_hi()).toEqual(a.name);

    new Alias(A).getter('hello', 'm_hi', true);
    // @ts-expect-error
    expect(a.hello).toEqual(a.name);
  });

  it ('can set setter alias', () => {
    class A {
      public name = 'world';

      set s_hi(name: string) {
        this.name = name;
      }
    }

    const a = new A();
    // @ts-expect-error
    expect(a.hello).toEqual(undefined);
    a.s_hi = 'earth';
    expect(a.name).toEqual('earth');

    new Alias(A).setter('hello', 's_hi');
    // @ts-expect-error
    a.hello = 'world';
    expect(a.name).toEqual('world');
  });

  it ('can set setter alias with method', () => {
    class A {
      public name = 'world';

      m_hi(name: string) {
        this.name = name;
      }
    }

    const a = new A();
    // @ts-expect-error
    expect(a.hello).toEqual(undefined);

    new Alias(A).setter('hello', 'm_hi', true);
    // @ts-expect-error
    a.hello = 'world';
    expect(a.name).toEqual('world');
  });

  it ('can set access alias', () => {
    class A {
      public name = 'world';

      set hi(name: string) {
        this.name = name;
      }

      get hi() {
        return this.name;
      }
    }

    const a = new A();
    a.hi = 'earth';
    expect(a.hi).toEqual('earth');
    expect(a.name).toEqual('earth');

    // @ts-expect-error
    expect(a.hello).toEqual(undefined);
    new Alias(A).access('hello', 'hi');
    // @ts-expect-error
    a.hello = 'world';
     // @ts-expect-error
    expect(a.hello).toEqual('world');
    expect(a.name).toEqual('world');
  });

  it ('should throw error when alias equivalent to from property', () => {
    class A {
      public name = 'world';

      m_hi() {
        return this.name;
      }
    }

    expect(() => new Alias(A).method('m_hi', 'm_hi')).toThrowError();
  });
});
