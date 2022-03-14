import { Link } from "remix";

export function NotFound() {
  return (
    <div>
      <h1>Not Found</h1>
      <div className="flex justify-center">
        <Link
          to="/"
          className="py-4 px-8 bg-blue-700 text-white rounded-full no-underline"
        >
          Begin Shopping
        </Link>
      </div>
    </div>
  );
}
