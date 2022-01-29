import { EventFrom, InterpreterFrom, StateFrom, assign } from "xstate";

import { createModel } from "xstate/lib/model";

export interface CheckoutContext {
  transitions: number;
}

export const checkoutModel = createModel(
  { transitions: 0 } as CheckoutContext,
  {
    events: {
      GOTO: (page: string) => ({ page }),
      NEXT: () => ({}),
      PREVIOUS: () => ({}),
    },
  },
);
export type CheckoutEvent = EventFrom<typeof checkoutModel>;

export const checkoutMachine = checkoutModel.createMachine({
  id: "checkout",
  initial: "first",
  on: {
    GOTO: [
      {
        cond: (_context, event) => event.page === "first",
        target: "first",
        actions: assign({ transitions: ({ transitions }) => transitions + 1 }),
      },
      {
        cond: (_context, event) => event.page === "second",
        target: "second",
        actions: assign({ transitions: ({ transitions }) => transitions + 1 }),
      },
      {
        cond: (_context, event) => event.page === "third",
        target: "third",
        actions: assign({ transitions: ({ transitions }) => transitions + 1 }),
      },
    ],
  },
  states: {
    first: {
      meta: { done: true },
      on: {
        NEXT: {
          target: "second",
          actions: assign({
            transitions: ({ transitions }) => transitions + 1,
          }),
        },
      },
    },
    second: {
      meta: { done: true },
      on: {
        PREVIOUS: {
          target: "first",
          actions: assign({
            transitions: ({ transitions }) => transitions + 1,
          }),
        },
        NEXT: {
          target: "third",
          actions: assign({
            transitions: ({ transitions }) => transitions + 1,
          }),
        },
      },
    },
    third: {
      meta: { done: true },
      on: {
        PREVIOUS: {
          target: "second",
          actions: assign({
            transitions: ({ transitions }) => transitions + 1,
          }),
        },
      },
    },
  },
});

export type CheckoutInterpreter = InterpreterFrom<typeof checkoutMachine>;
export type CheckoutState = StateFrom<typeof checkoutMachine>;
