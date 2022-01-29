import { createCookie } from "remix";

export const checkoutMachineCookie = createCookie("checkout-machine", {
  secrets: ["r3m1x-c0nF-zO2"],
});
