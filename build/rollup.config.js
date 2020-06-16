import commonjs from '@rollup/plugin-commonjs'; // Convert CommonJS modules to ES6
import vue from 'rollup-plugin-vue'; // Handle .vue SFC files
import buble from '@rollup/plugin-buble'; // Transpile/polyfill with reasonable browser support
export default {
    input: 'src/wrapper.js', // Path relative to package.json
    output: {
        name: 'Validator',
        exports: 'named',
    },
    plugins: [
        commonjs(),
        vue({
            compileTemplate: true, // Explicitly convert template to render function
        }),
        buble(), // Transpile to ES5
    ],
};