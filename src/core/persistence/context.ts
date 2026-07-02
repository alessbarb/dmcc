import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContext {
  commandId: string;
  counter: number;
}

export const requestContextStore = new AsyncLocalStorage<RequestContext>();
