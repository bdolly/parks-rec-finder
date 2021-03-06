/* eslint-disable no-unused-vars */
import tables from './CartoDBTables'
import QueryInterface from './QueryInterface'
import ProgramsQuery from './ProgramQueries'
import FacilitiesQuery from './FacilitiesQuery'

export default class TaxonomyQuery extends QueryInterface {
  constructor (Builder) {
    super(Builder)
    this.tableAlias = this.build.entity.DBTable
    this.query
        .from(this.build.entity.DBTable, this.tableAlias)
        .field('count(*)', 'count')
        .order('count', false)
    this.defineQuery()

    return this.query
  }

  defineQuery () {
    switch (this.build.entity.name) {
      case 'programCategories':
        this.query
            .field(`${this.tableAlias}.activity_category_name`)
            .field(`${this.tableAlias}.activity_category_description`)
            .field(`${this.tableAlias}.activity_category_photo`)
            .where('activity_category_is_published')
            .join(tables.programs, null, `${tables.programs}.activity_category->>0 = ${this.tableAlias}.id`)
        this.query = ProgramsQuery.joinWithAggregateData(this.query)
        this.query = ProgramsQuery.isPublished(this.query)
            .join(tables.assets, null, `${tables.facilities}.website_locator_points_link_id = ${tables.assets}.linkid`)
            .group(`${this.tableAlias}.activity_category_name, ${this.tableAlias}.activity_category_description, ${this.tableAlias}.activity_category_photo, ${tables.facilities}.facility_is_published`)
            .order('activity_category_name')

        break
      case 'facilityCategories':
        this.query
          .field(`${this.tableAlias}.location_type_name`)
          .field(`${this.tableAlias}.location_type_description`)
          .field(`${this.tableAlias}.location_type_photo`)
          .field(`${this.tableAlias}.location_type_is_published`)
          .field(`${this.tableAlias}.id`)
          .where(`${this.tableAlias}.location_type_is_published`)
          .join(tables.facilities, null, `${tables.facilities}.location_type->>0 = ${this.tableAlias}.id`)
        this.query = FacilitiesQuery.isPublished(this.query)
          .join(tables.assets, null, `${tables.facilities}.website_locator_points_link_id = ${tables.assets}.linkid`)
          .group(`${this.tableAlias}.location_type_name,
                  ${this.tableAlias}.location_type_description,
                  ${this.tableAlias}.location_type_photo,
                  ${this.tableAlias}.id,
                  ${this.tableAlias}.location_type_is_published`)
        break
    }
  }
}
