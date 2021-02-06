import { setInspector } from '../util/setInspector';

export abstract class Context<_ = {}, State = {}> {
  public readonly state: State = {} as State;

  constructor() {
    setInspector(this);
  }
}
