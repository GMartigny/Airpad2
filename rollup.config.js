/* eslint-disable import/no-extraneous-dependencies */
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

export default {
    input: "src/index.js",
    output: {
        file: "dist/airpad.js",
    },
    plugins: [
        nodeResolve(),
        terser(),
    ],
};
