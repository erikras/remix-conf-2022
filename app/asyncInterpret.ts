import {
  DefaultContext,
  EventObject,
  Interpreter,
  InterpreterOptions,
  State,
  StateMachine,
  StateSchema,
  Typestate,
  interpret,
} from "xstate";

export function asyncInterpret<
  TContext = DefaultContext,
  TStateSchema extends StateSchema = any,
  TEvent extends EventObject = EventObject,
  TTypestate extends Typestate<TContext> = {
    value: any;
    context: TContext;
  },
>(
  machine: StateMachine<TContext, TStateSchema, TEvent, TTypestate>,
  timeout: number,
  initialState?: State<TContext, TEvent, any, TTypestate>,
  initialEvent?: TEvent | TEvent["type"],
  options?: Partial<InterpreterOptions>,
): Promise<State<TContext, TEvent, any, TTypestate>> {
  const isDoneState = (state?: State<TContext, TEvent, any, TTypestate>) =>
    Boolean(
      state?.meta &&
        (Object.values(state.meta) as any[]).some((value) => value?.done),
    );
  return new Promise((resolve, reject) => {
    let t: ReturnType<typeof setTimeout> | undefined;
    let skipFirstDone = isDoneState(initialState);
    const service = interpret(machine, options);
    service.subscribe((state) => {
      console.info("state.meta", state.meta);
      if (isDoneState(state)) {
        console.info("done", state.value, !!t);
        if (skipFirstDone) {
          console.info("skipping first done");
          skipFirstDone = false;
          return;
        }
        if (t) clearTimeout(t);
        console.info("resolving");
        resolve(state);
      }
    });
    t = setTimeout(() => {
      console.info("-------- TIMED OUT");
      service.stop();
      reject();
    }, timeout);
    console.info("starting...");
    service.start(initialState);
    console.info("sending", initialEvent);
    if (initialEvent) {
      service.send(initialEvent);
    }
  });
}
