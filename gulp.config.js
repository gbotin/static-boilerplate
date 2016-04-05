var dest = "./build";
var src = "./src";

module.exports = {

  port: 3000,

  dest: dest,
  src: src,

  sourcemaps: true,
  minify: true,

  views: {
    dest: dest,
    paths: [
      src + "/**/*.{html,haml}"
    ]
  },

  images: {
    dest: dest + "/images",
    paths: [
      src + "/images/**/*.{jpg,jpeg,png,gif}"
    ]
  },

  fonts: {
    dest: dest + "/fonts",
    paths: [
      src + "/fonts/**/*.{eot,woff,woff2,svg,ttf,otf}"
    ]
  },

  styles: {
    dest: dest + "/css",
    paths: [
      src + "/styles/**/*"
    ],
    entrypoints: [
      src + "/styles/main.sass"
    ],
    includePaths: [

    ]
  },

  scripts: {
    dest: dest + "/js",
    paths: [
      src + "/scripts/**/*"
    ],
    entrypoint: src + "/scripts/app.es6",
    output: "bundle.js",
    includePaths: [

    ]
  }

};
