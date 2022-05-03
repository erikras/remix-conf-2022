import { assign, createMachine } from "xstate";
import { db } from "./db";

export const swagStoreMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGUDuBDKACZAXA9gE5gB0AwuobgMQAiYAxsQLZgB2uWACofhAK4NciUAAd8sAJa5J+NiJAAPRACYA7GpIA2AKwAOAIwAGACxH9BtSbUAaEAE9EavSQDMJgJwGtW1660q5jpqAL4hdmiYOATE5JQ0AJJsTGCsHNy8AkIK4lIycgrKCHqavvpaXpZ6rtU6do4Izm6e3r7+gTrBYREY2HhEpBRU1GQAFowA1vj8wkggudKy8nNFKtYkKjV+ejoqOgauB671iK6BG7trHlpGPiYqKt0gkX0xpMijkqKikmxQ1AAhdAMCZYAhYIazMQSRYFFaIYxGIzaayGAz6cxqAwqE4IPY6bRqTZeDzOQ5qIx6J4vaIDEgfL4-P7UAByYEUUPmMPyy1ART0ei0JFuFMsrh0fi8uJMgrcriMByMHhqBnuVPCz16tNiABl8OgIDhPt9fq90Lg4NQGSa-tFzXAsHqDZActyloVENVNJ0TGZdN5KZ5ceKVCQ1JdAu57mZXNStf1YlwADbA01YADyhAgYEI1Ez2cI3BTDBdcwWPI9eNu2hKvpUOxJehluN0JhIOhM-mcalJ+l2caiCdIAMkSaTpuoyeBYAzWZzrry7vhCBMvnblOCnb09aM6lxOl3Fx0Hn2WgOAtVOgHrzpI7HE6BIIXsN5SkQHgVYflHQ7Zj3DkQPsNksLRqjRX0iWvbUwGoABxfACGfCtly0KwSFXNRQKsVdrmPaVXBIJtXFFFRrnFA9QieNg+DgBQaSHOIqCQpc+VUAwXCxdRMVA7cdF8XEHiFHtxQ0DQSiRDx1R6Qc3npY0mSgZi4VYhBjAPNxt2MaoPGVHt93RI8T2xPwZV0KCGPzHMcEEEtYHgMs3WUt8EGPFwdK9Ix5SscNbAAhAtBlYVOwqQUe0pWMNXo2SnUNa0FLtC17OhRcnKKawPHQ0DiJuJFTBPYMzAuB4TAMLwbg6czZKnBg00swglNfIpvAy0j3F2LxtwVY4-JlDLw2PCVPGC7FKtvUdxz+BrKyJAiqgCvQFSsbwDH0gl8SMzZ3EFK9IvjN4ppQgiykFSoyVqExcQAWhKkh0QCUkWh0iVHjCEIgA */
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
          },
          {
            cond: "isShipping",
            target: ".Shipping",
          },
          {
            cond: "isBilling",
            target: ".Billing",
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
            "Back to Cart": {
              target: "Cart",
            },
            Next: {
              actions: "saveShipping",
              target: "Billing",
            },
          },
        },
        "Order Success": {
          tags: "pause",
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
        Billing: {
          tags: "pause",
          on: {
            "Place Order": {
              actions: "saveBilling",
              target: "Placing Order",
            },
            Back: {
              target: "Shipping",
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
