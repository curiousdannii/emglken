import globals from 'globals'
import js from '@eslint/js'

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 12,
            globals: {
                ...globals.browser,
                ...globals.es2020,
                ...globals.node,
            },
            sourceType: 'module',
        },
        rules: {
            'brace-style': ['error', 'stroustrup', {'allowSingleLine': true}],
            'comma-dangle': ['error', 'always-multiline'],
            curly: ['error'],
            eqeqeq: ['error', 'always', {null: 'ignore'}],
            indent: ['error', 4, {SwitchCase: 1}],
            'linebreak-style': ['error', 'unix'],
            'no-constant-condition': ['error', {checkLoops: false}],
            'no-control-regex': ['off'],
            'no-empty': ['error', {allowEmptyCatch: true}],
            'prefer-const': ['error', {destructuring: 'all'}],
            quotes: ['error', 'single'],
            semi: ['error', 'never'],
        },
    },
]