//https://nitro.unjs.io/config
export default defineNitroConfig({
  storage: {
    cache: {
      driver: "fs",
      base: './data/cache',
    }
  },
  devStorage: {
    cache: {
      driver: "fs",
      base: "./data/cache"
    }
  }
});
