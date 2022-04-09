import { assign, createMachine } from "xstate";
import { db } from "./db";

export const swagStoreMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGUDuBDKACZAXA9gE5gB0AwuobgMQAiYAxsQLZgB2uWACofhAK4NciUAAd8sAJa5J+NiJAAPRABYAnADYSKgMw6ArCoCMRvSoAcGgDQgAnogBM+oyX0AGDyf0B2fRr1uKgC+QTZomDgExOSUNACSbExgrBzcvAJCCuJSMnIKygjqaq46am5qanpG+vpq3jb2CEYaKtoVZf4qDhqBmiFhGNh4RKQUVNRkABaMANb4-MJIINnSsvJLBRpq5iTeRube3v5u5k71dog6Dq16V8ZOKro65v0g4UNRpMiTkqKikmwoNQAHJgRSLMQSVZ5DaIaoObwka4OQItA7eLo6BqXfQOEjNDS1DQaSzeNw6Iyvd6REYkb6-f6A6gAIXQDBmWAIWDGEOWUNy61ABSMDiuJGJKlRe3cKh82IQKNa5j03T0+j0W28Dipgxp0WZkgANoaAUDQeCsvy1vk4YZWkY3EYuhU3P5zLL5ZUbrdSiKTOoXqE3rrhvqjSamaz2ZactbYU19OZit5zCYnddKpVzPKdIF8cSWid3T4LDqIqHRnIAGaSQjMdAC6hcQ1ssBYADyhAgYEIMehgqUlx0WnMqNlko0KfM2YuCAlJGVVy2TpMlm1QepFfI1dr9cbAFEINIsAbjaa+wKbQgNQux4ZXVOZ41U0rbhoRSiTj4yx9aWQd3WDZrNQh7HvSfznksKyXvGpTFBSDjTuoToqP4aj6PKsqIqYRSHM4uKUhuIafNubA1oBjZRhyXI8hecZCkOI53hOj45uobQVMSVyGBSbj6D+eqkAAMvg6AQDgPwQYCkQNnA1DgYyHyybAWAiWJkB0TCDFNNUSqoohfjoYEOalAuKqHOSw6dAJW7Nmypodl2PbUJ23aENwLYMBpUFWlpg5ztsuz7IcxynHKs7zou3RqCu+waOuAzlp81AAOL4AQmkDgUXSem4JDtNsw7TtOroaCEQZsHwcAKJuJG0T5sZ+QUuI7A4ahtXsHQumobE6Bx2y4pOOhHDZJEKZBkKNVlcLDS4-gIhSKhkn4pw5jUZkBOoirVIGiW-mGZ6AplV7NNOSI+JOk7qKUzzyqOeJPM8ypkiiWyjX+AF7vRfJTSdoquKhljuG4iHxVcnp6PmLRdFsPh8To73RK5PY4IIXmwPADX9le059XsBw1N0zTOCo8qEjsi4GM86qHM8iPCaJ4njdJeDKcd8a40FBODcTTo5giG2ir4ewIt4aj0yQdkMA5yO9ljMHaRYD3tCtdqJhhEWQ7coMyv4ib0+z2n7PK+j5SrZJ7CSTpi+VQRAA */
  createMachine(
    {
      context: { cart: {} },
      id: "Swag Store",
      initial: "Cart",
      on: {
        Goto: [
          {
            cond: "isCart",
            target: ".Cart",
            internal: false,
          },
          {
            cond: "isShipping",
            target: ".Shipping",
            internal: false,
          },
          {
            cond: "isBilling",
            target: ".Billing",
            internal: false,
          },
          {
            cond: "isConfirmation",
            target: ".Confirmation",
            internal: false,
          },
        ],
      },
      states: {
        Cart: {
          tags: "pause",
          on: {
            "Decrement Product": {
              actions: "decrementProduct",
              target: "Cart",
              internal: false,
            },
            "Increment Product": {
              actions: "incrementProduct",
              target: "Cart",
              internal: false,
            },
            Checkout: {
              cond: "hasItems",
              target: "Load Shipping States",
            },
          },
        },
        Shipping: {
          tags: "pause",
          on: {
            Next: {
              actions: "saveShipping",
              target: "Billing",
            },
            "Back to Cart": {
              target: "Cart",
            },
          },
        },
        Billing: {
          tags: "pause",
          on: {
            Next: {
              actions: "saveBilling",
              target: "Confirmation",
            },
            Back: {
              target: "Shipping",
            },
          },
        },
        Confirmation: {
          tags: "pause",
          on: {
            "Place Order": {
              target: "Placing Order",
            },
            "Edit Billing": {
              target: "Billing",
            },
            "Edit Shipping": {
              target: "Shipping",
            },
            "Back to Cart": {
              target: "Cart",
            },
          },
        },
        "Order Success": {
          type: "final",
        },
        "Load Shipping States": {
          invoke: {
            src: "loadShippingStates",
          },
          on: {
            "Shipping States Loaded": {
              actions: "saveShippingStates",
              target: "Shipping",
            },
          },
        },
        "Placing Order": {
          invoke: {
            src: "placeOrder",
          },
          on: {
            "Order Placed": {
              target: "Order Success",
            },
          },
        },
      },
    },
    {
      actions: {
        decrementProduct: assign({
          cart: ({ cart }, event) => ({
            ...cart,
            [event.product]: (cart[event.product] ?? 1) - 1,
          }),
        }),
        incrementProduct: assign({
          cart: ({ cart }, event) => ({
            ...cart,
            [event.product]: (cart[event.product] ?? 0) + 1,
          }),
        }),
        saveBilling: assign({
          billing: (_context, event) => ({
            name: event.name,
            state: event.state,
          }),
        }),
        saveShipping: assign({
          billing: (context, event) => ({
            name: context.billing?.name ?? event.name,
            state: context.billing?.state ?? event.state,
          }),
          shipping: (_context, event) => ({
            name: event.name,
            state: event.state,
          }),
        }),
        saveShippingStates: assign({
          shippingStates: (_context, event) => event.shippingStates,
        }),
      },
      guards: {
        isCart: (_context, event) => event.destination === "Cart",
        isShipping: (_context, event) => event.destination === "Shipping",
        isBilling: (_context, event) => event.destination === "Billing",
        isConfirmation: (_context, event) =>
          event.destination === "Confirmation",
        hasItems: ({ cart }) =>
          Object.values(cart).some((quantity) => quantity > 0),
      },
      services: {
        loadShippingStates:
          ({ cart }) =>
          async (send) => {
            const products = Object.keys(cart).filter(
              (product) => cart[product] > 0,
            );
            const shippingStates = await db.fetchShippingStates(products);
            send({ type: "Shipping States Loaded", shippingStates });
          },
        placeOrder:
          ({ cart, billing, shipping }) =>
          async (send) => {
            await db.createOrder(cart, billing, shipping);
            send("Order Placed");
          },
      },
    },
  );
