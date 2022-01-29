import {
  ActionFunction,
  Form,
  LoaderFunction,
  json,
  redirect,
  useLoaderData,
} from "remix";
import {
  CheckoutContext,
  CheckoutEvent,
  CheckoutState,
  checkoutMachine,
  checkoutModel,
} from "~/checkoutMachine";

import { State } from "xstate";
import { asyncInterpret } from "../../asyncInterpret";
import { checkoutMachineCookie } from "~/cookies";

export const readCookie = async (request: Request) => {
  const oldCookie = request.headers.get("Cookie");
  return await checkoutMachineCookie.parse(oldCookie);
};

export function headers() {
  return {
    "Cache-control": "no-store",
    Pragma: "no-cache",
  };
}

export const loader: LoaderFunction = async ({
  request,
  params: { state },
}) => {
  const stateConfig = await readCookie(request);
  if (stateConfig) {
    // found state in cookie
    if (state) {
      const currentState = await checkoutMachine.resolveState(
        State.create(stateConfig),
      );
      if (stateConfig.value === state) {
        // the state from the cookie matches the url
        return currentState;
      } else {
        // transition to the state that matches the url, and return that
        const transitionState = await asyncInterpret(
          checkoutMachine,
          1000,
          currentState,
          checkoutModel.events.GOTO(state),
        );
        return json(transitionState, {
          headers: {
            "Set-Cookie": await checkoutMachineCookie.serialize(
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

export const action: ActionFunction = async ({
  request,
  params: { state },
}) => {
  const stateConfig = await readCookie(request);
  if (!stateConfig) return redirect(".."); // no cookie, so start over

  const currentState = checkoutMachine.resolveState(stateConfig);
  const values = Object.fromEntries(await request.formData());
  const event = values.event as CheckoutEvent["type"];
  const nextState = await asyncInterpret(
    checkoutMachine,
    1000,
    currentState,
    event,
  );
  if (nextState.value !== state) {
    return redirect(String(nextState.value), {
      headers: {
        "Set-Cookie": await checkoutMachineCookie.serialize(nextState),
      },
    });
  }
  return json(null, {
    headers: {
      "Set-Cookie": await checkoutMachineCookie.serialize(nextState),
    },
  });
};

export default function CheckoutPage() {
  const state = useLoaderData();
  return (
    <div>
      <h1>Remix Conf 2022 - Proof of Concept</h1>
      <h2>Transitions: {state.context.transitions}</h2>
      <h3>{state.value}</h3>
      <Form method="post">
        <button type="submit" name="event" value="PREVIOUS">
          Previous
        </button>
        <button type="submit" name="event" value="NEXT">
          Next
        </button>
      </Form>
    </div>
  );
}
