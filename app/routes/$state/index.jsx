import { Form, json, redirect, useLoaderData } from "remix";

import { State } from "xstate";
import { asyncInterpret } from "../../asyncInterpret";
import { swagStoreMachineCookie } from "../../cookies";
import { swagStoreMachine, pauseStates } from "../../swagStoreMachine";
import { Cart } from "../../store/Cart";
import { Shipping } from "../../store/Shipping";
import { Billing } from "../../store/Billing";
import { Confirmation } from "../../store/Confirmation";
import { OrderSuccess } from "../../store/OrderSuccess";
import { NotFound } from "../../store/NotFound";
import confetti from "../../confetti.css";

export const readCookie = async (request) => {
  const oldCookie = request.headers.get("Cookie");
  return await swagStoreMachineCookie.parse(oldCookie);
};

export function headers() {
  return {
    "Cache-control": "no-store",
    Pragma: "no-cache",
  };
}

export function links() {
  return [{ rel: "stylesheet", href: confetti }];
}

export const loader = async ({ request, params: { state } }) => {
  const stateConfig = await readCookie(request);
  if (stateConfig) {
    // found state in cookie
    if (state) {
      const currentState = await swagStoreMachine.resolveState(
        State.create(stateConfig),
      );
      if (stateConfig.value === state) {
        // the state from the cookie matches the url
        return json(
          currentState,
          currentState.done
            ? {
                headers: {
                  "Set-Cookie": await swagStoreMachineCookie.serialize(
                    {},
                    { expires: new Date(0) },
                  ),
                },
              }
            : undefined,
        );
      } else {
        // transition to the state that matches the url, and return that
        const transitionState = await asyncInterpret(
          swagStoreMachine,
          pauseStates,
          3_000,
          currentState,
          { type: "Goto", destination: state },
        );
        return json(transitionState, {
          headers: {
            "Set-Cookie": await swagStoreMachineCookie.serialize(
              transitionState,
            ),
          },
        });
      }
    }
  }
  // no cookie, so start over
  return redirect("..");
};

export const action = async ({ request, params: { state } }) => {
  const stateConfig = await readCookie(request);
  if (!stateConfig) return redirect(".."); // no cookie, so start over

  const currentState = swagStoreMachine.resolveState(stateConfig);
  const event = Object.fromEntries(await request.formData());

  const nextState = await asyncInterpret(
    swagStoreMachine,
    pauseStates,
    3_000,
    currentState,
    event,
  );
  if (nextState.value !== state) {
    return redirect(String(nextState.value), {
      headers: {
        "Set-Cookie": await swagStoreMachineCookie.serialize(nextState),
      },
    });
  }
  return json(
    {},
    {
      headers: {
        "Set-Cookie": await swagStoreMachineCookie.serialize(nextState),
      },
    },
  );
};

export default function Store() {
  const state = useLoaderData();

  switch (state.value) {
    case "Cart":
      return <Cart />;
    case "Shipping":
      return <Shipping />;
    case "Billing":
      return <Billing />;
    case "Confirmation":
      return <Confirmation />;
    case "Order Success":
      return <OrderSuccess />;
    default:
      return <NotFound />;
  }
}
