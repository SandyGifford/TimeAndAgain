module.exports = {
	root: true,
	settings: {
		react: {
			version: "detect",
		},
	},
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 6,
		sourceType: "module",
		ecmaFeatures: {
			jsx: true,
		},
	},
	plugins: [
		"@typescript-eslint",
	],
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:react/recommended",
	],
	rules: {
		"linebreak-style": ["error", "unix"],
		"quotes": ["error", "double"],
		"comma-dangle": ["error", "always-multiline"],
		"no-cond-assign": ["error", "always"],
		"no-console": "off",
		"object-curly-spacing": ["error", "always"],
		"array-bracket-spacing": ["error", "never"],
		"no-trailing-spaces": "error",
		"no-multi-spaces": "error",
		"eol-last": ["error", "always"],
		"no-case-declarations": "off",
		"prefer-const": ["error", { "destructuring": "all" }],

		"@typescript-eslint/ban-types": ["error"],
		"@typescript-eslint/no-use-before-define": "off",
		"@typescript-eslint/indent": ["error", "tab"],
		"@typescript-eslint/semi": ["error"],
		"@typescript-eslint/no-empty-interface": "off",
		"@typescript-eslint/explicit-module-boundary-types": ["off"], // causes errors with functions in indexed objects
		"@typescript-eslint/explicit-function-return-type": ["error", {
			"allowExpressions": true,
		}],
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/no-var-requires": ["error"],
		"@typescript-eslint/member-ordering": ["error", {
			"classes": [
				// Index signature
				"signature",

				// Static Fields
				"public-static-field",
				"protected-static-field",
				"private-static-field",

				// Static Methods
				"public-static-method",
				"protected-static-method",
				"private-static-method",

				// Instance fields
				"public-instance-field",
				"protected-instance-field",
				"private-instance-field",

				// Abstract Fields
				"public-abstract-field",
				"protected-abstract-field",
				"private-abstract-field",

				// Constructors
				"public-constructor",
				"protected-constructor",
				"private-constructor",

				// Instance Methods
				"public-instance-method",
				"protected-instance-method",
				"private-instance-method",

				// Abstract Methods
				"public-abstract-method",
				"protected-abstract-method",
				"private-abstract-method",
			],
		}],

		"react/display-name": "off",
		"react/self-closing-comp": ["error"],
		"react/sort-comp": [2, {
			order: [
				"static-variables",
				"instance-variables",
				"static-methods",
				"lifecycle",
				"render",
				"everything-else",
				"instance-methods",
			],
		}],
		"react/no-direct-mutation-state": ["error", "always"],
		"react/jsx-tag-spacing": ["error", {
			"closingSlash": "never",
			"beforeSelfClosing": "always",
			"afterOpening": "never",
			"beforeClosing": "never",
		}],
		"react/jsx-pascal-case": "error",
		"react/jsx-no-target-blank": "error",
		"react/jsx-no-script-url": "error",
		"react/jsx-no-duplicate-props": "error",
		"react/jsx-max-props-per-line": ["error", { "when": "multiline", "maximum": 1 }],
		"react/jsx-fragments": "error",
		"react/jsx-first-prop-new-line": ["error", "multiline"],
		"react/jsx-equals-spacing": ["error", "never"],
		"react/jsx-curly-spacing": ["error", { "when": "never", "children": true }],
		"react/jsx-curly-newline": ["error", "consistent"],
		"react/jsx-curly-brace-presence": ["error", "never"],
		"react/jsx-closing-bracket-location": ["error", "after-props"],
		"react/jsx-boolean-value": ["error", "never"],
		"react/void-dom-elements-no-children": "error",
		"react/state-in-constructor": "error",
		"react/no-unused-state": "error",
		"react/no-unsafe": "error",
		"react/no-unescaped-entities": 0,
		"react/no-string-refs": "error",
		"react/no-find-dom-node": "off",
		"react/prop-types": "off",
	},
};
