import { EventFrom, InterpreterFrom } from "xstate";

import { createModel } from "xstate/lib/model";

interface CheckoutContext {}

export const checkoutModel = createModel({} as CheckoutContext, {
  events: {
    NEXT: () => ({}),
    PREVIOUS: () => ({}),
  },
});
export type CheckoutEvent = EventFrom<typeof checkoutModel>;

export const checkoutMachine = checkoutModel.createMachine({
  id: "checkout",
  initial: "first",
  states: {
    first: {
      meta: { done: true },
      on: {
        NEXT: "second",
      },
    },
    second: {
      meta: { done: true },
      on: {
        PREVIOUS: "first",
        NEXT: "third",
      },
    },
    third: {
      meta: { done: true },
      on: {
        PREVIOUS: "second",
      },
    },
  },
});

export type CheckoutInterpreter = InterpreterFrom<typeof checkoutMachine>;
