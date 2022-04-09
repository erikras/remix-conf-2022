import { useLoaderData } from "remix";
import { EventButton } from "../components/EventButton";

export function Confirmation() {
  const state = useLoaderData();
  return (
    <div>
      <h1>Order Confirmation</h1>
      <div>You are about to order:</div>
      <div className="mx-auto max-w-sm">
        {Object.entries(state.context.cart).map(([product, quantity]) => (
          <div className="flex">
            <div className="text-right">{quantity}</div>
            <div className="mx-4">x</div>
            <div>{product}</div>
          </div>
        ))}
        <div className="flex justify-end">
          <EventButton
            event="Goto"
            payload={{ destination: "Cart" }}
            className="px-4 py-2 bg-blue-500 select-none ml-3 rounded-full text-white"
          >
            « Edit Cart
          </EventButton>
        </div>
      </div>
      <div className="mx-auto max-w-sm">
        <h3>Shipping</h3>
        <div className="flex">
          <div className="font-semibold mr-4 w-14">Name:</div>
          <div>{state.context.shipping?.name}</div>
        </div>
        <div className="flex">
          <div className="font-semibold mr-4 w-14">State:</div>
          <div>{state.context.shipping?.state}</div>
        </div>
        <div className="flex justify-end">
          <EventButton
            event="Goto"
            payload={{ destination: "Shipping" }}
            className="px-4 py-2 bg-blue-500 select-none ml-3 rounded-full text-white"
          >
            « Edit Shipping
          </EventButton>
        </div>
      </div>
      <div className="mx-auto max-w-sm">
        <h3>Billing</h3>
        <div className="flex">
          <div className="font-semibold mr-4 w-14">Name:</div>
          <div>{state.context.billing?.name}</div>
        </div>
        <div className="flex">
          <div className="font-semibold mr-4 w-14">State:</div>
          <div>{state.context.billing?.state}</div>
        </div>
        <div className="flex justify-end">
          <EventButton
            event="Goto"
            payload={{ destination: "Billing" }}
            className="px-4 py-2 bg-blue-500 select-none ml-3 rounded-full text-white"
          >
            « Edit Billing
          </EventButton>
        </div>
      </div>
      <div className="flex justify-center mt-10">
        <EventButton
          event="Place Order"
          className="py-4 px-8 bg-blue-700 text-white rounded-full"
        >
          Place Order
        </EventButton>
      </div>
    </div>
  );
}
