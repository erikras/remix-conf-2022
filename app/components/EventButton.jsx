import { Form } from "remix";

export function EventButton({ children, className, event, payload }) {
  return (
    <Form method="post" className="inline">
      {payload &&
        Object.keys(payload).length > 0 &&
        Object.entries(payload).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      <input type="hidden" name="type" value={event} />
      <button type="submit" className={className}>
        {children}
      </button>
    </Form>
  );
}
