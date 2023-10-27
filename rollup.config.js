import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { string } from "rollup-plugin-string";
import terser from '@rollup/plugin-terser';
import pkg from './package.json';

export default [

    // parsers lib
    {
        input: 'src/dist-lib-parsers/main.js',
        output: {
            name: 'Parsers',
            file: pkg.lib_parsers,
            format: 'umd'
        },
        plugins: []
    },

    // browser-friendly UMD build - for public use
    {
        input: 'src/dist-public/main.js',
        output: {
            name: 'FinanceJS',
            file: pkg.browser_public,
            format: 'umd'
        },
        plugins: [
            resolve(), // so Rollup can find libraries
            commonjs(), // so Rollup can convert libraries to an ES modules
            string({
                include: "examples/*.*",
                exclude: []
            })
        ]
    },

    // browser-friendly UMD build - for public use - MINIMIZED
    {
        input: 'src/dist-public/main.js',
        output: {
            name: 'FinanceJS',
            file: pkg.browser_public_min,
            format: 'umd'
        },
        plugins: [
            resolve(), // so Rollup can find libraries
            commonjs(), // so Rollup can convert libraries to an ES modules
            string({
                include: "examples/*.*",
                exclude: []
            }),

            terser()
        ]
    },

    // browser-friendly UMD build - for private use (logged users)
    {
        input: 'src/dist-private/main.js',
        output: {
            name: 'FinanceJS',
            file: pkg.browser_private,
            format: 'umd'
        },
        plugins: [
            resolve(), // so Rollup can find libraries
            commonjs() // so Rollup can convert libraries to an ES modules
        ]
    }
];
