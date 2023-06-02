module.exports = {
    "env": {
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "extends": "standard",
    "rules": {
        "no-extra-semi": "error",
        "semi": [2, "always"],
        "no-prototype-builtins": "off"
    }
};