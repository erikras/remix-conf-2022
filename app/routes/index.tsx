import {
  ActionFunction,
  Form,
  LoaderFunction,
  json,
  useLoaderData,
} from "remix";
import {
  CheckoutEvent,
  CheckoutInterpreter,
  checkoutMachine,
  checkoutModel,
} from "~/checkoutMachine";
import { State, interpret } from "xstate";

import { ReactNode } from "react";
import { asyncInterpret } from "../asyncInterpret";
import { checkoutMachineCookie } from "~/cookies";

interface LoaderData {
  state: "first" | "second" | "third";
}

const getCheckoutState = async (
  request: Request,
): Promise<CheckoutInterpreter["state"]> => {
  const oldCookie = request.headers.get("Cookie");
  const stateConfig = await checkoutMachineCookie.parse(oldCookie);
  if (stateConfig) {
    console.info("from cookie", stateConfig.value);
    const state = checkoutMachine.resolveState(State.create(stateConfig));
    return state;
  } else {
    console.info("not from cookie");
    return await asyncInterpret(checkoutMachine, 1000);
  }
};

const setCheckoutState = async (
  checkoutState: CheckoutInterpreter["state"],
): Promise<Response> => {
  console.info("setting checkout", checkoutState.value);
  return json(checkoutState, {
    headers: {
      "Set-Cookie": await checkoutMachineCookie.serialize(checkoutState),
    },
  });
};

export const loader: LoaderFunction = async ({ request }) => {
  const checkoutState = await getCheckoutState(request);
  return await setCheckoutState(checkoutState);
};

export const action: ActionFunction = async ({ request }) => {
  const state = await getCheckoutState(request);
  const values = Object.fromEntries(await request.formData());
  const event = values.event as CheckoutEvent["type"];
  console.info("action", state.value, event);
  return await setCheckoutState(
    await asyncInterpret(checkoutMachine, 1000, state, event),
  );
};

const EventButton = ({
  children,
  event,
}: {
  children: ReactNode;
  event: CheckoutEvent["type"];
}) => (
  <button type="submit" name="event" value={event}>
    {children}
  </button>
);

export default function Index() {
  const data = useLoaderData();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <div>
        <Form method="post">
          <EventButton event="PREVIOUS">PREVIOUS</EventButton>
          <EventButton event="NEXT">NEXT</EventButton>
        </Form>
      </div>
      <pre>{JSON.stringify(data, undefined, 2)}</pre>
    </div>
  );
}
