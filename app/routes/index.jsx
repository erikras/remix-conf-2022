import { redirect } from "remix";
import { asyncInterpret } from "../asyncInterpret";
import { swagStoreMachineCookie } from "../cookies";
import { swagStoreMachine } from "../swagStoreMachine";
import { readCookie } from "./$state";

export const loader = async ({ request }) => {
  const stateConfig = await readCookie(request);
  if (stateConfig) {
    // already have cookie. Redirect to correct url
    return redirect(String(stateConfig.value));
  }

  const swagStoreState = await asyncInterpret(swagStoreMachine, 3_000);
  return redirect(String(swagStoreState.value), {
    headers: {
      "Set-Cookie": await swagStoreMachineCookie.serialize(swagStoreState),
    },
  });
};

export default function Index() {
  return null;
}
