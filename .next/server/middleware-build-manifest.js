self.__BUILD_MANIFEST = {
  "polyfillFiles": [
    "static/chunks/polyfills.js"
  ],
  "devFiles": [
    "static/chunks/react-refresh.js"
  ],
  "ampDevFiles": [],
  "lowPriorityFiles": [],
  "rootMainFiles": [],
  "pages": {
    "/": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/index.js"
    ],
    "/_app": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_app.js"
    ],
    "/_error": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_error.js"
    ],
    "/analytics": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/analytics.js"
    ],
    "/configuration": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/configuration.js"
    ],
    "/reports": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/reports.js"
    ],
    "/test-runner": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/test-runner.js"
    ]
  },
  "ampFirstPages": []
};
self.__BUILD_MANIFEST.lowPriorityFiles = [
"/static/" + process.env.__NEXT_BUILD_ID + "/_buildManifest.js",
,"/static/" + process.env.__NEXT_BUILD_ID + "/_ssgManifest.js",

];