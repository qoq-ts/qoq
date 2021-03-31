import { ParameterizedContext } from 'koa';

export type WebCtx<Props = {}, State = {}> = ParameterizedContext<State, Props>;
