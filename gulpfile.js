let preprocessor = "sass", // Preprocessor (sass, less, styl); 'sass' also work with the Scss syntax in blocks/ folder.
    fileswatch = "html,htm,txt,json,md,woff2,pug"; // List of files extensions for watching & hard reload

import pkg from "gulp";
const { gulp, src, dest, parallel, series, watch } = pkg;

import browserSync from "browser-sync";
import bssi from "browsersync-ssi";
import ssi from "ssi";
import webpackStream from "webpack-stream";
import webpack from "webpack";
import TerserPlugin from "terser-webpack-plugin";
import gulpSass from "gulp-sass";
import dartSass from "sass";
import sassglob from "gulp-sass-glob";
const sass = gulpSass(dartSass);
import less from "gulp-less";
import lessglob from "gulp-less-glob";
import styl from "gulp-stylus";
import stylglob from "gulp-noop";
import postCss from "gulp-postcss";
import cssnano from "cssnano";
import autoprefixer from "autoprefixer";
import imagemin from "gulp-imagemin";
import changed from "gulp-changed";
import concat from "gulp-concat";
import rsync from "gulp-rsync";
import { deleteAsync } from "del";

import pug from "gulp-pug";

import svgmin from "gulp-svgmin";
import svgSprite from "gulp-svg-sprite";
import cheerio from "gulp-cheerio";
import replace from "gulp-replace";

function browsersync() {
    browserSync.init({
        server: {
            baseDir: "app/",
            middleware: bssi({ baseDir: "app/", ext: ".html" }),
        },
        ghostMode: { clicks: false },
        notify: false,
        online: true,
        browser: "google chrome",
        // tunnel: 'yousutename', // Attempt to use the URL https://yousutename.loca.lt
    });
}

function svg() {
    return src(["app/img/_icons/*.svg"])
        .pipe(
            svgmin({
                js2svg: {
                    pretty: true,
                    indent: 2,
                },
                plugins: [
                    {
                        cleanupIDs: {
                            minify: true,
                        },
                    },
                ],
            })
        )
        .pipe(
            cheerio({
                run: function ($) {
                    $("[fill]").removeAttr("fill");
                    // $('[stroke]').removeAttr('stroke');
                    // $('[style]').removeAttr('style');
                    $("[xmlns]").removeAttr("xmlns");
                },
                parserOptions: { xmlMode: true },
            })
        )
        .pipe(replace("&gt;", ">"))
        .pipe(
            svgSprite({
                mode: {
                    symbol: {
                        sprite: "../sprite.svg",
                        example: true,
                    },
                },
                svg: {
                    xmlDeclaration: true,
                },
            })
        )
        .pipe(dest("app/img/"))
        .pipe(dest("../wp-content/themes/rugby/assets/img/"))
        .pipe(browserSync.stream());
}

function scripts() {
    return (
        src(["app/js/*.js", "!app/js/*.min.js"])
            .pipe(
                webpackStream(
                    {
                        mode: "production",
                        performance: { hints: false },
                        plugins: [
                            new webpack.ProvidePlugin({
                                $: "jquery",
                                jQuery: "jquery",
                                "window.jQuery": "jquery",
                            }), // jQuery (npm i jquery)
                        ],
                        module: {
                            rules: [
                                {
                                    test: /\.m?js$/,
                                    exclude: /(node_modules)/,
                                    use: {
                                        loader: "babel-loader",
                                        options: {
                                            presets: ["@babel/preset-env"],
                                            plugins: [
                                                "babel-plugin-root-import",
                                            ],
                                        },
                                    },
                                },
                            ],
                        },
                        optimization: {
                            minimize: true,
                            minimizer: [
                                new TerserPlugin({
                                    terserOptions: {
                                        format: { comments: false },
                                    },
                                    extractComments: true,
                                }),
                            ],
                        },
                    },
                    webpack
                )
            )
            .on("error", function (err) {
                this.emit("end", err);
            })
            .pipe(concat("app.min.js"))
            .pipe(dest("app/js"))
            // .pipe(dest("../wp-content/themes/rugby/assets/js"))
            .pipe(browserSync.stream())
    );
}

function styles() {
    return (
        src([`app/_${preprocessor}/app.${preprocessor}`])
            .pipe(eval(`${preprocessor}glob`)())
            .on("error", function (err) {
                console.log(err, 1);
            })
            .pipe(eval(preprocessor)({ "include css": true }))
            .on("error", function (err) {
                console.log(err, 2);
            })
            .pipe(
                postCss([
                    autoprefixer({ grid: "autoplace" }),
                    cssnano({
                        preset: [
                            "default",
                            { discardComments: { removeAll: true } },
                        ],
                    }),
                ])
            )
            .on("error", function (err) {
                console.log(err, 3);
            })
            .pipe(concat("app.min.css"))
            .on("error", function (err) {
                console.log(err, 4);
            })
            .pipe(dest("app/css"))
            .on("error", function (err) {
                console.log(err, 5);
            })
            // .pipe(dest("../wp-content/themes/rugby/assets/css"))
            .pipe(browserSync.stream())
            .on("error", function (err) {
                console.log(err);
            })
    );
}

function puginclude() {
    return src(["app/_pug/*.pug"])
        .pipe(
            pug({
                doctype: "html",
                pretty: "    ",
            })
        )
        .pipe(dest("app"));
}

function images() {
    return src(["app/img/src/**/*"])
        .pipe(changed("app/img/dist"))
        .pipe(imagemin())
        .pipe(dest("app/img/dist"))
        .pipe(browserSync.stream());
}

function startwatch() {
    watch(`app/_pug/**/*.pug`, { usePolling: true }, puginclude);

    watch(`app/_${preprocessor}/**/*`, { usePolling: true }, styles);
    watch(
        ["app/js/**/*.js", "!app/js/**/*.min.js"],
        { usePolling: true },
        scripts
    );
    watch("app/img/src/**/*", { usePolling: true }, images);
    watch(`app/**/*.{${fileswatch}}`, { usePolling: true }).on(
        "change",
        browserSync.reload
    );
}

export { scripts, styles, images, svg };
export let assets = series(scripts, styles, images);
export let build = series(images, scripts, styles);

export default series(
    scripts,
    styles,
    images,
    svg,
    parallel(browsersync, startwatch)
);
