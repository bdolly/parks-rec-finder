<template>
  <section :class="['pprf-filter-bar', {'pprf-filter-bar--open': open, 'pprf-filter-bar--disabled': disabled}]">
    <header
      class="pprf-filter-bar__header"
    >

      <div @click="toggleOpen">
        <h4 class="text-nopad"> <font-awesome-icon class="pprf-filter-bar__header__filter-icon" size="xs" icon="filter"/> Filters</h4>
        <font-awesome-icon class="pprf-filter-bar__header__toggle-icon" :icon="open ? 'minus' : 'plus'" />
      </div>

      <div
        v-show="!open && filtersApplied"
        class="pprf-filter-bar-tags-bar"
      >
        <h5 class="screen-reader-text">Applied Search Filters:</h5>
        <ul class="pprf-filter-bar-tags">
         <li v-for="(value, key) in tags" >
            <button
              class="pprf-filter-bar-filter-tag"
              @click="removeFilter(key)"
            >
              {{value}}
              <font-awesome-icon
                icon="times"
                size="xs"
                class="pprf-filter-bar-filter-tag__remove"
              />
            </button>
          </li>
        </ul>
      </div>

    </header>
    <form
      :class="[{'pprf-filter-bar-form__open':open}, 'pprf-filter-bar-form']"
      @submit.prevent="onSubmit"
      ref="searchFilterForm"
    >
      <div class="scrollable">
      <fieldset class="pprf-filter-bar-form--fieldset">

        <legend>Cost</legend>

        <v-radio-group
          v-model="filtersData.fee"
          :mandatory="false"
        >
          <v-radio
            class="field field--inline field--inline-half field-fee--free"
            label="Free"
            value="Free"
            :hide-details="true"
            :ripple="false"
          ></v-radio>
          <v-radio
            class="field field--inline field-fee--fee"
            label="Fee"
            value="Fee"
            :hide-details="true"
            :ripple="false"
          ></v-radio>
        </v-radio-group>
      </fieldset>


      <fieldset class="pprf-filter-bar-form--fieldset">

        <legend>Age Range</legend>

          <v-checkbox
            class="field field--inline field--inline-half"
            v-model="selectedAgeRanges"
            v-for="(ageGroup, idx) in ageGroups"
            :value="ageGroup.range"
            :label="ageGroup.name"
            :key="ageGroup.name"
            ref="filter-age"
            light
          >
          </v-checkbox>

      </fieldset>


      <fieldset class="pprf-filter-bar-form--fieldset">

        <legend>Gender</legend>
         <v-radio-group
            class="input-group--flex input-group__gender"
            v-model="filtersData.gender"
            :mandatory="false"
          >
          <v-radio
            class="field field--inline"
            v-for="gender in genders"
            :key="gender.name"
            :label="gender.name"
            :value="gender.value"
          ></v-radio>

        </v-radio-group>
      </fieldset>

      <fieldset
        v-if="days.length"
        class="pprf-filter-bar-form--fieldset"
      >
        <legend>Day of week</legend>
        <v-checkbox
            v-for="day in days"
            class="field field--inline field--inline-quarter"
            :label="day.days_name"
            :key="day.id"
            :value="day.id"
            v-model="selectedDays"
            ref="filter-day"
        >
          </v-checkbox>

      </fieldset>

      <!-- <fieldset class="pprf-filter-bar-form--fieldset">
        <legend>Program Dates</legend>
        <v-menu
          class="field field--inline field--inline-half"
          lazy
          :close-on-content-click="false"
          transition="scale-transition"
          origin="bottom center"
          full-width
          max-width="290px"
          min-width="290px"
        >
          <h4 class="field-picker__header">Program Start Date</h4>
          <v-text-field
            slot="activator"
            label="Start Date"
            append-icon="event"
            v-model="startDateFormatted"
            @blur="filtersData.startDate = parseDate(startDateFormatted)"
            readonly
          ></v-text-field>
            <v-date-picker
              no-title
              v-model="filtersData.startDate"
              @input="startDateFormatted = formatDate($event)"
              color="blue"
              actions
            >
            <template slot-scope="{ save, cancel }">
              <v-card-actions>
                <v-btn flat color="primary" @click="cancel">Cancel</v-btn>
                <v-btn flat color="primary" @click="save">OK</v-btn>
              </v-card-actions>
            </template>
          </v-date-picker>

        </v-menu>
        <font-awesome-icon icon="arrow-right" />
        <v-menu
          class="field field--inline field--inline-half field--end-date"
          lazy
          :close-on-content-click="false"
          transition="scale-transition"
          origin="bottom center"
          full-width
          max-width="290px"
          min-width="290px"
        >
          <h4 class="field-picker__header">Program End Date</h4>
          <v-text-field
            slot="activator"
            label="End Date"
            append-icon="event"
            v-model="endDateFormatted"
            @blur="filtersData.endDate = parseDate(endDateFormatted)"
            readonly
          ></v-text-field>
            <v-date-picker
              v-model="filtersData.endDate"
              @input="endDateFormatted = formatDate($event)"
              no-title
              color="blue"
              actions
            >
            <template slot-scope="{ save, cancel }">
              <v-card-actions>
                <v-btn flat color="primary" @click="cancel">Cancel</v-btn>
                <v-btn flat color="primary" @click="save">OK</v-btn>
              </v-card-actions>
            </template>
          </v-date-picker>
        </v-menu>
      </fieldset> -->

      <footer class="pprf-filter-bar-footer">

        <phila-button class="pprf-filters--cancel" @click.prevent="clearFilters">
          Cancel
        </phila-button>

        <phila-button class="pprf-filters--apply" :disabled="!isDirty">
          Apply Filters
        </phila-button>

      </footer>
      </div>
    </form>
  </section>
</template>

<script>
import LocalCacheManager from '@/sources/LocalCacheManager'
import PhilaButton from '@/components/phila/phila-button'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import _ from 'underscore'

/**
 * SEARCH FILTER BAR
 *
 * Manages filtering entities list both by user filter selection and
 * query param changes.
 *
 * @since 0.1.0
 */
export default {
  name: 'PPRF-Filter-Bar',

  components: {FontAwesomeIcon, PhilaButton},
  props: {
    disabled: {
      default: false
    }
  },
  data () {
    return {
      open: false,

      filtersApplied: false,

      ageGroups: [
        {
          name: 'Tot 2-5 (or younger)',
          range: [2, 5]
        },
        {
          name: 'Youth (6-12)',
          range: [6, 12]
        },
        {
          name: 'Teen (13-19)',
          range: [13, 19]
        },
        {
          name: 'Adult (20-55)',
          range: [20, 55]
        },
        {
          name: 'Senior (56+)',
          range: [56, 99]
        }
      ],

      genders: [
        {
          name: 'All Genders',
          value: 'M/F'
        },
        {
          name: 'Male',
          value: 'M'
        },
        {
          name: 'Female',
          value: 'F'
        }
      ],

      selectedAgeRanges: [],

      days: [],

      selectedDays: [],

      startDateFormatted: null,

      endDateFormatted: null,

      filtersData: {
        fee: null,
        gender: null,
        days: [],
        ages: null,
        startDate: null,
        endDate: null
      }
    }
  },

  mounted () {
    /**
     * get out Time of Week values directly from
     * the ppr_days table so we can pass their
     * ids to the queries in the api
     *
     * @since 0.1.0
     */
    this.days = LocalCacheManager.getRow('daysTable')

    // update filters on deep link
    let searchFiltersFromRoute = _.intersection(Object.keys(this.$store.state.route.query), Object.keys(this.filtersData))
    if (searchFiltersFromRoute.length > 0) {
      this._updateFiltersFromRoute()
    }
  },

  computed: {
    /**
     * check if user has interacted with form values
     * @return {Boolean} true if a filter has been selected
     *
     * @since 0.1.3
     */
    isDirty () {
      return Object.values(this.filters).some((filterVal, idx, arr) => { return filterVal !== null })
    },

    /**
     * derived filter key:value pairs
     * @return {object}
     *
     * @since 0.1.3
     */
    filters () {
      let ages = {ages: this.selectedAgeRanges.length ? `${this.ageRange.low}-${this.ageRange.high}` : null}
      let days = {days: this.selectedDays.length ? this.selectedDays : null}
      return Object.assign({}, this.filtersData, ages, days)
    },
    /**
     * dervied age range low and high
     * used to build age range string
     * @return {object}
     *
     * @since 0.1.0
     */
    ageRange () {
      return {
        low: this.ages.length ? Math.min.apply(Math, this.ages) : null,
        high: this.ages.length ? Math.max.apply(Math, this.ages) : null
      }
    },
    /**
     * flattened array of all selected ages in the age range
     * @type {array}
     *
     * @since 0.1.0
     */
    ages: {
      set: function (newVal) {
        this.selectedAgeRanges.push(newVal)
      },
      get: function () {
        return _.flatten(this.selectedAgeRanges)
      }
    },

    tags () {
      let filters = Object.assign(
                      {},
                      this.filters,
                      {days: this.selectedDays.length ? `${this.filters.days.length} day(s) a week` : null},
                      {ages: this.selectedAgeRanges.length ? `Ages ${this.filters.ages}` : null},
                      {startDate: this.filtersData.startDate ? `Starts: ${this.startDateFormatted}` : null},
                      {endDate: this.filtersData.endDate ? `Ends: ${this.endDateFormatted}` : null}
                    )
      return _.omit(filters, val => _.isNull(val))
    }
  },

  methods: {
    toggleOpen () {
      this.open = !this.open
      this.$store.dispatch('toggleMobileFilters')
      if (this.open) {
        this.$store.dispatch('dataLoading')
      } else {
        this.$store.dispatch('dataLoaded')
      }
    },
    /**
     * On Form Submission submit search with filter values
     *
     * @return {void}
     *
     * @public
     * @since 0.1.0
     */
    onSubmit () {
      this._updateRouteFromFilters()
      this.$emit('applyFilters', this.filters)
      this.open = false
      this.filtersApplied = this.isDirty
      this.$store.dispatch('toggleMobileFilters', false)
    },

    /**
     * Reset all filter values to null
     *
     * @return {void}
     *
     * @public
     * @since 0.1.0
     */
    clearFilters () {
      this.selectedAgeRanges = []
      this.selectedDays = []
      this.startDateFormatted = null
      this.endDateFormatted = null
      this.filtersData = {
        fee: null,
        gender: null,
        days: [],
        ages: null,
        startDate: null,
        endDate: null
      }
      this._updateRouteFromFilters()
      this.$emit('clearFilters')
      this.open = false
      this.filtersApplied = false
      this.onSubmit()
      // this.$store.dispatch('dataLoaded')
    },
    /**
     * Given a filter property nullify the value
     * @param  {string} filterKey filter property
     *
     * @public
     * @since 0.1.0
     */
    removeFilter (filterKey) {
      switch (filterKey) {
        case 'ages':
          this.selectedAgeRanges = []
          break
        case 'days':
          this.selectedDays = []
          this.filtersData.days = []
          break
        case 'startDate':
          this.startDateFormatted = null
          this.filtersData.startDate = null
          break
        case 'endDate':
          this.endDateFormatted = null
          this.filtersData.endDate = null
          break
        default:
          this.filtersData[filterKey] = null
      }
      this.$store.dispatch('dataLoading')
      this.onSubmit()
    },
    /**
     * Update url params from user selected filter values.
     * Pushes new query to router history
     * @return {void}
     *
     * @since 0.1.0
     */
    _updateRouteFromFilters () {
      let ages = this.ages.length ? this.filters.ages : null
      let _query = Object.assign({}, this.$store.state.route.query, this.filters, {ages})
      let query = _.omit(_query, val => _.isNull(val))
      this.$router.push({query})
    },

    /**
     * Update the local state with filter values from url parametes
     *
     * @return {void}
     * @since 0.1.0
     */
    _updateFiltersFromRoute () {
      let queryParams = Object.keys(this.$store.state.route.query)
      let filterKeys = Object.keys(this.filters)
      // check to see if any filters are in url params
      let paramKeys = _.intersection(queryParams, filterKeys)

      if (paramKeys.length > 0) {
        // update filters with url parma values
        paramKeys.forEach(key => {
          switch (key) {
            case 'ages':
              // get the array of age values from query params
              let agesFromParams = this.$store.state.route.query[key].split('-').map(st => parseInt(st))
              // loop through our age range checkboxes
              for (let i = 0; i < this.$refs['filter-age'].length; i++) {
                let $ref = this.$refs['filter-age'][i]
                // check to see if there values fall within the range of values from the query params
                if (_.intersection($ref.value, _.range(agesFromParams[0], agesFromParams[1])).length > 0) {
                  // update local state
                  this.selectedAgeRanges.push(this.ageGroups[i].range)
                  // hack to show the boxes as checked
                  $ref.$el.children[1].children[0].innerHTML = 'check_box'
                }
              }
              break
            case 'days':
              // this.selectedDays.push(this.$store.state.route.query[key])
              break
            // case 'fee':
            //   this.filters[key] = this.$store.state.route.query[key]
            //   break
            default:
              this.filtersData[key] = this.$store.state.route.query[key]
              break
          }
        })
        this.filtersApplied = true
      } else {
        // clear filter values
        this.selectedAgeRanges = []
        this.selectedDays = []
        this.filtersData = {
          fee: null,
          gender: null,
          days: [],
          ages: null
        }
      }
    },

    formatDate (date) {
      if (!date) {
        return null
      }

      const [year, month, day] = date.split('-')
      return `${month}/${day}/${year}`
    },
    parseDate (date) {
      if (!date) {
        return null
      }

      const [month, day, year] = date.split('/')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
  },
  watch: {
    '$route.query': function (val) {
      this._updateFiltersFromRoute()
      if (this.$store.state.route.name !== 'Search') {
        this.$emit('applyFilters', this.filters)
        this.open = false
        this.filtersApplied = this.isDirty
      }
    },
    'disabled': function (val) {
      if (this.open) {
        this.open = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.pprf-filter-bar{
  width: 100%;
  color: $black;
  display: block;
  position:relative;
  z-index:5;
  background: lighten(color(light-ben-franklin), 10%);
  border-top: 1px solid $white;
  &:hover{ cursor: pointer; cursor: hand; }
}
.pprf-filter-bar--disabled{
  opacity: 0.5;
  pointer-events: none;
  .pprf-filter-bar-form{
    display: none !important;
  }
}
.pprf-sidebar--nopad {
  .pprf-filter-bar__header {padding: 0 20px;}
}
.pprf-filter-bar__header{
  h4{display:inline; marign-bottom:0; padding-bottom:0;}
}
.pprf-filter-bar__header__filter-icon{
  vertical-align: -0.5%;
}

.pprf-filter-bar__header__toggle-icon{
    margin:2% 2% 0 2%;
    float:right;
}

.field-picker__header {
  width: 100%;
  background: color(dark-ben-franklin);
  color:$white;
  text-align: center;
  font-weight: 700;
  padding: 10px;
  @include rem(font-size, 2);
  text-transfrom: uppercase;

}

.pprf-filter-bar-tags-bar{
  width: 100%;
  display:flex;
}

.pprf-filter-bar-tags{
  display: flex;
  margin:0;
  padding:0;
  list-style:none;
}

.pprf-filter-bar-filter-tag{
  display: flex;
  border: none;
  border-radius: 10px;
  padding: 2px 5px;
  align-items: center;
  font-weight: 700;
  //background: lighten(color(sidewalk), 5%);
  background: $white;
  color: color(ben-franklin-blue);
  border: 1px solid color(ben-franklin-blue);
  margin:0px 5px 5px 5px;
  @include rem(font-size, 1.25);
  &:hover{
    cursor: hand;
    cursor: pointer;
    .svg-inline--fa.pprf-filter-bar-filter-tag__remove{opacity: 1;}
  }
}

  .svg-inline--fa.pprf-filter-bar-filter-tag__remove{
    margin:4px 0px 3px 8px;
    opacity: 0.5;
    transition: all 0.5s ease;
    color: color(love-park-red);
    &:hover{
      cursor: pointer;
      cursor: hand;
    }
  }



.pprf-filter-bar-form{
  width: 100%;
  display:none;
  background: color(ghost-gray);
}
.input-group__gender{
  width: 80%;
}

.pprf-filter-bar-form__open{
  display: block;
  position:absolute;
  height: 100vh;
  z-index: 10002;
  overflow: scroll;

  .scrollable{
    position:absolute;
    height: calc(100vh - 300px);
    overflow:scroll;
    padding-bottom: 50px;
  }
}

.pprf-filter-bar-footer{
  width: 100%;

  display:flex;
  justify-content: flex-end;
  padding-right: 10px;
  margin-top:50px;
  .button{
    padding:10px;
    margin: 0 10px;
    font-weight: 700;
    font-family: $font-montserrat;
    color: $white;
    &:hover{cursor: pointer; cursor: hand;}
  }
  .pprf-filters--cancel{
    background: $black;
  }
}


@include breakpoint (medium down) {
  .pprf-sidebar__desc{
    min-height: 0px;
    p {padding:0; margin:0;}
  }
  .pprf-filter-bar-form__open{
    z-index: 30000;
  }
}

</style>
