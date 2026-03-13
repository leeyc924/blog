module.exports = {
  testEnvironment: "jsdom",
  collectCoverageFrom: [
    "static/js/**/*.js",
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
