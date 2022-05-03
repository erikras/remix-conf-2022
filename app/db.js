const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const db = {
  fetchShippingStates: async (products) => {
    await sleep(1_000);
    const states = ["North Carolina"];
    if (products.includes("Centered.app Hoodie")) {
      states.push("California");
    }
    if (products.includes("Reactathon 2022 T-shirt")) {
      states.push("Utah");
    }
    states.sort();
    return states;
  },

  createOrder: async (products, billing, shipping) => {
    await sleep(2_000);
    return {
      products,
      billing,
      shipping,
    };
  },
};
