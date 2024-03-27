module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from @typescript-eslint/eslint-plugin
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  overrides: [],
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser for TypeScript
  parserOptions: {
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
    ecmaVersion: 'latest', // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'prettier', // Runs Prettier as an ESLint rule and reports differences as individual ESLint issues
  ],
  rules: {
    "comma-dangle": ["error", "never"],
    'prettier/prettier': 'error', // Indicates any deviations from Prettier's default settings as errors
    'react/react-in-jsx-scope': 'off', // React 17+ doesn't require React to be in scope when using JSX
    'react/prop-types': 'off', // Disables prop-types rule, as TypeScript is used for type checking
  },
};
