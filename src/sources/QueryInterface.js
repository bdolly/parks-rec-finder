export default class QueryInterface {
  constructor (Builder) {
    this.build = Builder
    this.query = this.build.postgreSQL.select()
  }

  defineQuery () {
  }
}
