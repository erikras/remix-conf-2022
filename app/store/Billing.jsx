import { Form, useLoaderData } from "remix";
import { EventButton } from "../components/EventButton";

export function Billing() {
  const state = useLoaderData();
  return (
    <div>
      <h1>Billing</h1>
      <EventButton event="Back">« Back to Shipping</EventButton>

      <Form method="post">
        <div className="mt-4">
          <label className="block">
            <span className="text-gray-700 ml-5">Name</span>
            <input
              className="mt-1 block w-full rounded-full py-3 px-5"
              type="text"
              name="name"
              placeholder="Name"
              defaultValue={state.context.billing?.name}
              required
              autoFocus
            />
          </label>
        </div>
        <div className="mt-4">
          <label className="block">
            <span className="text-gray-700 ml-5">State</span>
            <select
              className="mt-1 block w-full rounded-full py-3 px-5 appearance-none relative"
              name="state"
              defaultValue={state.context.billing?.state}
            >
              <option value="">Select a state...</option>
              {state.context.shippingStates?.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex justify-center mt-5">
          <button
            type="submit"
            name="type"
            value="Next"
            className="py-4 px-8 bg-blue-700 text-white rounded-full"
          >
            Next »
          </button>
        </div>
      </Form>
    </div>
  );
}
