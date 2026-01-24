module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "es6": true,
        "mocha": true
    },
    "globals": {
        "globalThis": "readonly"
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "sourceType": "module",
        "ecmaFeatures": {
            "arrowFunctions": true,
            "binaryLiterals": false,
            "blockBindings": true,
            "classes": true,
            "defaultParams": true,
            "destructuring": true,
            "forOf": true,
            "generators": true,
            "modules": true,
            "objectLiteralComputedProperties": true,
            "objectLiteralDuplicateProperties": false,
            "objectLiteralShorthandMethods": true,
            "objectLiteralShorthandProperties": true,
            "octalLiterals": false,
            "regexUFlag": false,
            "regexYFlag": false,
            "restParams": true,
            "spread": true,
            "superInFunctions": true,
            "templateStrings": true,
            "unicodeCodePointEscapes": false,
            "globalReturn": false,
            "impliedStrict": true,
            "jsx": false
        }
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "array-bracket-spacing"             : [ 1, "always" ]                                                           , // disallow or enforce spaces inside of brackets
        "arrow-body-style"                  : [ 2, "as-needed" ]                                                        , // require braces in arrow function body
        "arrow-parens"                      : [ 2, "always" ]                                                           , // require parens in arrow function arguments
        "arrow-spacing"                     : [ 1, { "before": true, "after": true } ]                                  , // require space before/after arrow function"s arrow
        "eol-last"                          : 1                                                                         , // enforce newline at the end of file, with no multiple empty lines
        "keyword-spacing"                   : [ 1, {
            "overrides": { "catch": { "after": false }, "if": { "after": false }, "for": { "after": false }, "switch": { "after": false }, "while": { "after": false } }
        } ]                                                                                                             , // enforce spacing before and after keywords
        "no-trailing-spaces"                : 1                                                                         , // disallow trailing whitespace at the end of lines
        "no-unused-vars"                    : 0                                                                         , // disallow declaration of variables that are not used in the code
        "no-undef"                          : 0                                                                         , // disallow use of undeclared variables unless mentioned in a /*global */ block
        "semi"                              : [ 2, "always" ]                                                           , // require or disallow semicolons instead of ASI
        "space-before-blocks"               : 0                                                                         , // require or disallow a space before blocks
        "space-before-function-paren"       : [ 1, {
            "anonymous" : "never",
            "named"     : "never",
            "asyncArrow": "always"
        } ]                                                                                                             , // require or disallow a space before function parenthesis
        "space-in-parens"                   : [ 1, "always" ]                                                           , // require or disallow spaces inside parentheses
        "template-curly-spacing"            : [ 1, "always" ]                                                           , // enforce usage of spacing in template strings
        "@typescript-eslint/adjacent-overload-signatures": 2,
        "@typescript-eslint/explicit-function-return-type": 0,
        "@typescript-eslint/explicit-member-accessibility": 0,
        "@typescript-eslint/member-delimiter-style": 2,
        "@typescript-eslint/member-ordering": 0,
        "@typescript-eslint/no-angle-bracket-type-assertion": 0,
        "@typescript-eslint/no-array-constructor": 2,
        "@typescript-eslint/no-empty-interface": 0,
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/no-inferrable-types": 0,
        "@typescript-eslint/no-namespace": [ 2, { "allowDeclarations": false, "allowDefinitionFiles": false } ],
        "@typescript-eslint/no-non-null-assertion": 0,
        "@typescript-eslint/no-parameter-properties": 2,
        "@typescript-eslint/no-triple-slash-reference": 0,
        "@typescript-eslint/no-type-alias": 0,
        "@typescript-eslint/no-unused-vars": [ 1, { "vars": "local", "args": "none", "ignoreRestSiblings": true } ],
        "@typescript-eslint/no-use-before-define": [ 2, { "classes": false, "functions": false, "typedefs": false, "variables": false } ],
        "@typescript-eslint/no-var-requires": 0,
        "@typescript-eslint/prefer-namespace-keyword": 2,
        "@typescript-eslint/type-annotation-spacing": 0
    }
};
