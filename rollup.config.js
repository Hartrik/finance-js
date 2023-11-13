import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { string } from "rollup-plugin-string";
import terser from '@rollup/plugin-terser';
import pkg from './package.json';

export default [

    // app
    {
        input: 'src/app-main/main.js',
        plugins: [
            resolve(), // so Rollup can find libraries
            commonjs(), // so Rollup can convert libraries to an ES modules
            string({
                include: "examples/*.*",
                exclude: []
            })
        ],
        output: [
            {
                // browser-friendly UMD build
                name: 'FinanceJS',
                file: 'dist/finance-js.umd.js',
                banner: pkg.copyright,
                format: 'umd',
                sourcemap: true,
            },
            {
                // browser-friendly UMD build, MINIMIZED
                name: 'FinanceJS',
                file: 'dist/finance-js.umd.min.js',
                format: 'umd',
                sourcemap: true,
                plugins: [
                    terser({
                        sourceMap: true,
                        format: {
                            preamble: pkg.copyright,
                            comments: false
                        }
                    })
                ]
            }
        ]
    },

    // parsers lib
    {
        input: 'src/app-lib-parsers/main.js',
        output: {
            name: 'Parsers',
            file: 'dist/lib-parsers.umd.js',
            format: 'umd'
        },
        plugins: []
    }
];
