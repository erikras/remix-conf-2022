import { json, redirect, useLoaderData } from "remix";
import { State } from "xstate";
import { asyncInterpret } from "../../asyncInterpret";
import confetti from "../../confetti.css";
import { swagStoreMachineCookie } from "../../cookies";
import { Billing } from "../../store/Billing";
import { Cart } from "../../store/Cart";
import { NotFound } from "../../store/NotFound";
import { OrderSuccess } from "../../store/OrderSuccess";
import { Shipping } from "../../store/Shipping";
import { swagStoreMachine } from "../../swagStoreMachine";

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
  if (!stateConfig || !state) {
    // No cookie, so start over
    return redirect("..");
  }
  // Convert cookie into machine state
  const currentState = await swagStoreMachine.resolveState(
    State.create(stateConfig),
  );
  if (stateConfig.value === state) {
    // The state from the cookie matches the url
    return json(
      currentState,
      currentState.done // Clear the cookie if we are done
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
    // Transition to the state that matches the url, and return that
    const transitionState = await asyncInterpret(
      swagStoreMachine, //                     machine definition
      3_000, //                                timeout
      currentState, //                         current state
      { type: "Goto", destination: state }, // event to send
    );
    return json(transitionState, {
      headers: {
        "Set-Cookie": await swagStoreMachineCookie.serialize(transitionState),
      },
    });
  }
};

export const action = async ({ request, params: { state } }) => {
  const stateConfig = await readCookie(request);
  if (!stateConfig) return redirect(".."); // No cookie, so start over

  const currentState = swagStoreMachine.resolveState(stateConfig);
  const event = Object.fromEntries(await request.formData());

  const nextState = await asyncInterpret(
    swagStoreMachine,
    3_000,
    currentState,
    event,
  );
  return redirect(String(nextState.value), {
    headers: {
      "Set-Cookie": await swagStoreMachineCookie.serialize(nextState),
    },
  });
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
    case "Order Success":
      return <OrderSuccess />;
    default:
      return <NotFound />;
  }
}
