module.exports = {
    'env': {
        'commonjs': true,
        'es2020': true,
        'shared-node-browser': true,
    },
    'extends': 'eslint:recommended',
    'globals': {
        'TextEncoder': 'readonly',
    },
    'parserOptions': {
        'ecmaVersion': 12
    },
    'root': true,
    'rules': {
        'eqeqeq': ['error', 'always', {'null': 'ignore'}],
        'indent': ['error', 4],
        'linebreak-style': ['error', 'unix'],
        'no-empty': ['off'],
        'no-var': ['error'],
        'prefer-const': ['error', {"destructuring": "all"}],
        'quotes': ['error', 'single'],
        'semi': ['error', 'never'],
    },
}