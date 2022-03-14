import { Link } from "remix";
import { Confetti } from "../components/Confetti";
import { EventButton } from "../components/EventButton";

export function OrderSuccess() {
  return (
    <>
      <div className="flex flex-col justify-center z-10 absolute top-0 left-0 right-0 bottom-0">
        <div className="flex justify-center">
          <div>
            <h1>Order Success!</h1>
            <div className="flex justify-center mt-10">
              <Link
                to="/Cart"
                className="py-4 px-8 bg-blue-700 text-white rounded-full no-underline"
              >
                Buy More Swag
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Confetti />
    </>
  );
}
