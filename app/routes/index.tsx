import {
  ActionFunction,
  Form,
  LoaderFunction,
  json,
  redirect,
  useLoaderData,
} from "remix";
import {
  CheckoutEvent,
  CheckoutInterpreter,
  checkoutMachine,
  checkoutModel,
} from "~/checkoutMachine";

import { asyncInterpret } from "../asyncInterpret";
import { checkoutMachineCookie } from "~/cookies";
import { readCookie } from "./$state";

interface LoaderData {
  state: "first" | "second" | "third";
}

export const setCheckoutState = async (
  checkoutState: CheckoutInterpreter["state"],
): Promise<Response> =>
  json(checkoutState, {
    headers: {
      "Set-Cookie": await checkoutMachineCookie.serialize(checkoutState),
    },
  });

export const loader: LoaderFunction = async ({ request }) => {
  const stateConfig = await readCookie(request);
  if (stateConfig) {
    // already have cookie. Redirect to crrect url
    return redirect(String(stateConfig.value));
  }

  const checkoutState = await asyncInterpret(checkoutMachine, 1000);
  return redirect(String(checkoutState.value), {
    headers: {
      "Set-Cookie": await checkoutMachineCookie.serialize(checkoutState),
    },
  });
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
  return null;
}
