import pprfLeafletMapContainer from '@/containers/main/map/pprf-leaflet-map-container'
// import pprfSidebar from '@/components/pprf-sidebar'
import pprfSidebarSearchContainer from '@/containers/sidebar/pprf-sidebar-search-container'
import pprfSidebarCategoriesContainer from '@/containers/sidebar/pprf-sidebar-categories-container'
import pprfSidebaCategoryEntitiesContainer from '@/containers/sidebar/pprf-sidebar-category-entities-container'
import pprfSidebarProgramDetailContainer from '@/containers/sidebar/pprf-sidebar-program-detail-container'
import pprfSidebarLocationDetailContainer from '@/containers/sidebar/pprf-sidebar-location-detail-container'

// order of route definitions is important
// they need to be ordered from most to least specific
// in order for the route params to function properly
// @see https://router.vuejs.org/en/essentials/dynamic-matching.html
//
const routes = [
  {
    path: '/', redirect: '/activities'
  },
  {
    path: '/search',
    name: 'Search',
    components: {
      'main': pprfLeafletMapContainer,
      'sidebar': pprfSidebarSearchContainer
    },
    meta: {
      bodyClass: 'view--search'
    }
  },
  {
    path: '/program/:program_id',
    name: 'Program Detail',
    components: {
      'main': pprfLeafletMapContainer,
      'sidebar': pprfSidebarProgramDetailContainer
    },
    props: { default: true, sidebar: true },
    meta: {
      bodyClass: 'view--entity-detail'
    }
  },

  {
    path: '/location/:facility_id',
    name: 'Location Detail',
    components: {
      'main': pprfLeafletMapContainer,
      'sidebar': pprfSidebarLocationDetailContainer
    },
    props: { default: true, sidebar: true },
    meta: {
      bodyClass: 'view--entity-detail'
    }
  },

  {
    path: '/:entityType/:entityTerm+',
    name: 'Taxonxomy Term Entities',
    components: {
      'main': pprfLeafletMapContainer,
      'sidebar': pprfSidebaCategoryEntitiesContainer
    },
    props: { default: true, sidebar: true },
    meta: {
      bodyClass: 'view--entity-list'
    }
  },
  {
    path: '/:entityType',
    name: 'Taxonomy Terms',
    components: {
      'main': pprfLeafletMapContainer,
      'sidebar': pprfSidebarCategoriesContainer
    },
    props: { default: true, sidebar: true },
    meta: {
      bodyClass: 'view--taxonomy-list'
    }
  }
]
export default routes
