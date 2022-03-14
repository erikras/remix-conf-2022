import { createCookie } from "remix";

export const swagStoreMachineCookie = createCookie("swag-store-machine", {
  secrets: ["r3m1x-c0nF-2022"],
});
