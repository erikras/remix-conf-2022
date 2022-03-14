import { interpret } from "xstate";

export function asyncInterpret(
  machine,
  pauseStates,
  msToWait,
  initialState,
  initialEvent,
) {
  const isPauseState = (state) => pauseStates.includes(state?.value);

  return new Promise((resolve, reject) => {
    let timeout;
    let skipFirstPause = isPauseState(initialState);
    const service = interpret(machine);

    // Subscribe to changes
    service.subscribe((state) => {
      if (isPauseState(state)) {
        if (skipFirstPause) {
          skipFirstPause = false;
          return;
        }
        if (timeout) clearTimeout(timeout);
        resolve(state);
      }
    });

    // Timeout
    timeout = setTimeout(() => {
      service.stop();
      reject();
    }, msToWait);

    // Start Service
    service.start(initialState);
    if (initialEvent) {
      service.send(initialEvent);
    }
  });
}
