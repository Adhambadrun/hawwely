module.exports = {
  root: true,
  extends: ['expo'],
  ignorePatterns: ['dist/*', 'node_modules/*', 'lib/shared/*'],
  overrides: [{ files: ['scripts/**/*.js', '*.config.js'], env: { node: true } }],
};
