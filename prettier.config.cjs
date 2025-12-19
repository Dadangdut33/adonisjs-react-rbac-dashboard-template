const adonisConfig = require('@adonisjs/prettier-config')

module.exports = {
  ...adonisConfig,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: ['^#', '<THIRD_PARTY_MODULES>', '^@/', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ['typescript', 'decorators-legacy', 'jsx'],
}
