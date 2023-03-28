import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { string } from "rollup-plugin-string";
import pkg from './package.json';

export default [
    // browser-friendly UMD build - for public use
    {
        input: 'src/public/main.js',
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

    // browser-friendly UMD build - for private use (logged users)
    {
        input: 'src/private/main.js',
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
