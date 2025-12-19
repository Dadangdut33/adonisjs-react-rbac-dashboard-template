import { SnakeCaseNamingStrategy as SnakeCaseNaming } from '@adonisjs/lucid/orm'

export default class SnakeCaseNamingStrategy extends SnakeCaseNaming {
  // we dont change anything but keeping this file for future customizations
  // you can also change it to CamelCaseNamingStrategy if you prefer camelCase
  // I use snake_case for this to keep consistency when inputting data and getting data from DB
}
