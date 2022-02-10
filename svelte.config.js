import preprocess from "svelte-preprocess";
import adapter from "@sveltejs/adapter-netlify";

// See https://kit.svelte.dev/docs/configuration for latest

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess({
    scss: {
      includePaths: ["./node_modules/normalize.css/"],
    },
  }),
  kit: {
    adapter: adapter(),
    vite: {
      build: {
        target: ["es6"],
      },
    },
  },
};

export default config;
