import { assign, createMachine } from "xstate";
import { db } from "./db";

export const pauseStates = [
  "Cart",
  "Shipping",
  "Billing",
  "Confirmation",
  "Order Success",
];

export const swagStoreMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGUDuBDKACZAXA9gE5gB0AwuobgMQAiYAxsQLZgB2uWACofhAK4NciUAAd8sAJa5J+NiJAAPRAEYATAHYAzCTUAWABwaVATj0BWPSYAM1gwBoQAT0QBaczrVetagGy+tE3VfAy09AF9wxzRMHAJickoaAEk2JjBWDm5eASEFcSkZOQVlBHUtXxI9AIMDIOsK8xVfRxcEV1NzEms9Yy1zA0stU3VI6IxsPCJSCipqMgALRgBrfH5hJBAC6Vl5TdKTQZIVZt8TLQ1fazUDPTVWxH1rEhM+oxMPEKu1MZAYyfipGQC0kolEkjYUGoADkwIoNmIJDtivtVOZfBpjsYNK9jDccfdnIhAl1-P5zk0NNZLlpfv84tMSMDQeDIdQAELoBjLLAELCzBFbJFFPagUrqdEkcznYx1PTWEKHB4INQVEihMJ6KxhDRqGwaOkTBkJdmSAA2ZohUNh8Pywt2JTRBkqeguWgMXgClkMypUtj0JC0QbC7pOgSDhtiUxN5stbM53LthQdqLKARMx3l5g8VhU-XRyqDKhIZMuNwGBLU5kjAMZZDkADNJIRmOgRdQuGauWAsAB5QgQMCEJPI0VKYny9US6zmGe+U4OIkIXWVDVaBVV9SvH5RP5G6MzRvN1vtgCiEGkWFNFqtI5FjoQYWeBmns-RC+VRlXwY0tw9m9pXd6QPcgjxbNtdmoc9L2ZMFb02bZ71TJ8pyrGc5w-JdzA0Lo11-QwvCaQDxijQFQLYJtwPbBMeT5AU7xTMUJ2fV8MP8Rc2kCSpZ2sP0jHUFRsN8GtjVIAAZfB0AgHAQTgyE4jbOBqFg1kAUU2AsAkqTIAYlEmLKEMqgGLxtEMWpemVcw-ClHFrl1Zo7mdESQM7LkrT7Ach2oftB0IbguwYHSEPtPTx2XFQDBIHDbFsXVVWsEwWiXFd1WDDcmj1XVnMBagAHF8AIXSx1KO5lSCboYs0F8wlqMxIl3Ng+DgBRgLI+jguTULxV4yoEo9D1XRwvNzGVO4SzJeVErUUxXgMbLGRU+DEU64rVD0E4pV8fRnU0ecIo4xB1ufINqgMHpnTCasgP3MjrzjKAiofFQcJ0LarHlc71w9T9dSqYN4rsIxBnmhJ6wo48INCxDGLC9RMUsL51t8Dx0UGX1eIDMkQj1VU1GuEwQdIHyhxwQRAtgeAOtHB99RLfRDiCZH+g0ZVdUitc-F6aVfFdQmSC06TFvkvB1Me1M-Uldd+kCeU-EOA6ECsromn8MMTrqPnXIYdzieHKmkP02c1ClQT5ypSxpTfVmGkDYNXRfPNzmIvdSOmMX9Ii5VXBuZ4emMAJ-F-Owenq8IgA */
  createMachine(
    {
      context: { cart: {} },
      id: "Swag Store",
      initial: "Cart",
      on: {
        Goto: [
          {
            cond: "isCart",
            target: "#Swag Store.Cart",
          },
          {
            cond: "isShipping",
            target: "#Swag Store.Shipping",
          },
          {
            cond: "isBilling",
            target: "#Swag Store.Billing",
          },
          {
            cond: "isConfirmation",
            target: "#Swag Store.Confirmation",
          },
          {
            cond: "isOrderSuccess",
            target: "#Swag Store.Order Success",
          },
        ],
      },
      states: {
        Cart: {
          on: {
            "Decrement Product": {
              actions: "decrementProduct",
              target: "#Swag Store.Cart",
            },
            "Increment Product": {
              actions: "incrementProduct",
              target: "#Swag Store.Cart",
            },
            Checkout: {
              cond: "hasItems",
              target: "#Swag Store.Load Shipping States",
            },
          },
        },
        Shipping: {
          on: {
            Next: {
              actions: "saveShipping",
              target: "#Swag Store.Billing",
            },
            "Back to Cart": {
              target: "#Swag Store.Cart",
            },
          },
        },
        Billing: {
          on: {
            Next: {
              actions: "saveBilling",
              target: "#Swag Store.Confirmation",
            },
            Back: {
              target: "#Swag Store.Shipping",
            },
          },
        },
        Confirmation: {
          on: {
            "Place Order": {
              target: "#Swag Store.Placing Order",
            },
            "Edit Billing": {
              target: "#Swag Store.Billing",
            },
            "Edit Shipping": {
              target: "#Swag Store.Shipping",
            },
            "Back to Cart": {
              target: "#Swag Store.Cart",
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
              target: "#Swag Store.Shipping",
            },
          },
        },
        "Placing Order": {
          invoke: {
            src: "placeOrder",
          },
          on: {
            "Order Placed": {
              target: "#Swag Store.Order Success",
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
        isOrderSuccess: (_context, event) =>
          event.destination === "Order Success",
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
