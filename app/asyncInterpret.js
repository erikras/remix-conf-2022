import { interpret } from "xstate";
import { waitFor } from "xstate/lib/waitFor";

export async function asyncInterpret(
  machine,
  msToWait,
  initialState,
  initialEvent,
) {
  const service = interpret(machine);
  service.start(initialState);
  if (initialEvent) {
    service.send(initialEvent);
  }
  return await waitFor(
    service,
    (state) => state.hasTag("pause") || state.done,
    { timeout: msToWait },
  );
}
