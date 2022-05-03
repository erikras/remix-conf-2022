import { Form } from "@remix-run/react";

export function NextButton() {
  return (
    <Form method="post">
      <button type="submit" name="type" value="Next">
        Next
      </button>
    </Form>
  );
}
