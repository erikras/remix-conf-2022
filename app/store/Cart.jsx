import { useLoaderData } from "remix";
import { EventButton } from "../components/EventButton";

export function Cart() {
  return (
    <div>
      <h1>Cart</h1>

      <ProductRow name="Reactathon 2022 T-shirt" />
      <ProductRow name="Centered.app Hoodie" />
      <div className="flex justify-center">
        <EventButton
          event="Checkout"
          className="py-4 px-8 bg-blue-700 text-white rounded-full"
        >
          Proceed to Checkout
        </EventButton>
      </div>
    </div>
  );
}

function ProductRow({ name }) {
  const state = useLoaderData();
  return (
    <div className="flex w-full p-2">
      <div className="mr-10">{name}</div>
      <div className="flex-1" />
      <div>{state.context.cart[name] ?? 0}</div>
      <div className="ml-10">
        <EventButton
          className="px-4 bg-blue-400 select-none ml-3 rounded"
          event="Decrement Product"
          payload={{ product: name }}
        >
          -
        </EventButton>
        <EventButton
          className="px-4 bg-blue-400 select-none ml-3 rounded"
          event="Increment Product"
          payload={{ product: name }}
        >
          +
        </EventButton>
      </div>
    </div>
  );
}
