module.exports = {
  rootDir: __dirname,
  testMatch: [
    '<rootDir>/storyshots.test.js',
  ],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
};
