const path = require('path')
const root = path.resolve(__dirname)
const list = ['components','layouts','lang','mixins','pages','plugins','store']

module.exports = {
    resolve: {
        extensions: ['.js','.cjs','.mjs','.json','.vue'],
        root,

        alias: {
            ...list.reduce((a, d) => ({ ...a, [d]: path.resolve(__dirname, d) }), {}),

            '@': root,
            '~': root
        }
    }
}
